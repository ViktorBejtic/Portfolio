import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Collections;

public class Clusterer {
    public static void setup(int clusterer,int k){
        long start_time = System.currentTimeMillis();
        ArrayList<POINT> Points = generate_points(20, true);
        ArrayList<POINT> Centers = generate_points(k, false);
        ArrayList<ArrayList<POINT>> clusters = new ArrayList<>();

        if(clusterer == 1 || clusterer == 2){
            clusters = k_means(clusterer, k, clusters, Centers, Points);
            Centers = clusters.get(0);
            clusters.remove(0);
        }else{
            clusters.add(Points);
            clusters = divisive_clustering(clusters);
            Centers = calculate_centers(clusters, 1);
        }
        long end_time = System.currentTimeMillis();

        check_success(clusters, Centers, Points.size());

        System.out.println("\n"+(end_time - start_time)+"\n");

        JavaToPython.write_clusters(clusters, "Clusters");
        JavaToPython.write_centers(Centers, "Centers");
        JavaToPython.start_python();

    }

    public static ArrayList<ArrayList<POINT>> k_means(int clusterer, int k, ArrayList<ArrayList<POINT>> clusters, ArrayList<POINT> Centers, ArrayList<POINT> Points){
        ArrayList<POINT> old_Centers = new ArrayList<>();

        int count = 0;
        while(!decide_if_end_k_means(Centers, old_Centers)){
            count++;
            clusters = sort_points(Centers, Points);
            old_Centers = Centers;
            Centers = calculate_centers(clusters, clusterer);
            Collections.sort(Centers);
        }

        if(clusterer != 3){
            System.out.println("\nNumber of iterations: " + count);
        }

        clusters.add(0, Centers);

        return clusters;
    }

    public static ArrayList<ArrayList<POINT>> divisive_clustering(ArrayList<ArrayList<POINT>> clusters){

        while(!decide_if_end_divisive_clustering(clusters)){
            ArrayList<POINT> cluster = choose_cluster_to_split(clusters);
            clusters = split_cluster(clusters, cluster);
        }

        return clusters;
    }

    public static boolean decide_if_end_k_means(ArrayList<POINT> Centers, ArrayList<POINT> old_Centers) {
        if (Centers.size() != old_Centers.size()) {
            return false;
        }

        for (int i = 0; i < Centers.size(); i++) {
            POINT Center = Centers.get(i);
            POINT old_Center = old_Centers.get(i);

            if (Center.getX() != old_Center.getX()) {
                return false;
            }
            if (Center.getY() != old_Center.getY()) {
                return false;
            }
        }

        return true;
    }

    public static boolean decide_if_end_divisive_clustering(ArrayList<ArrayList<POINT>> clusters){

        for(ArrayList<POINT> cluster : clusters){
            if(500 < calculate_average_distance_from_center(calculate_Centroid(cluster), cluster)){
                return false;
            }
        }

        return true;
    }

    public static ArrayList<POINT> choose_cluster_to_split(ArrayList<ArrayList<POINT>> clusters) {
        ArrayList<POINT> biggest_cluster = new ArrayList<>();
        double biggest_average_distance = 0, average_distance = 0;

        for(ArrayList<POINT> cluster : clusters){
            POINT center = calculate_Centroid(cluster);
            average_distance = calculate_average_distance_from_center(center, cluster);
            if(average_distance > biggest_average_distance){
                biggest_average_distance = average_distance;
                biggest_cluster = cluster;
            }
        }

        clusters.remove(biggest_cluster);
        return biggest_cluster;
    }

    public static double calculate_average_distance_from_center(POINT center, ArrayList<POINT> cluster) {
        
        if (cluster.isEmpty()) {
            return 0;
        }
        
        double total_distance = 0;
        
        for (POINT point : cluster) {
            total_distance += calculate_distance(center, point);
        }

        return total_distance / cluster.size();
    }

    public static ArrayList<ArrayList<POINT>> split_cluster(ArrayList<ArrayList<POINT>> clusters, ArrayList<POINT> cluster) {
        ArrayList<ArrayList<POINT>> new_clusters = new ArrayList<>();
        ArrayList<POINT> Centroids = generate_points(2, false);
        new_clusters = k_means(3, 2, new_clusters, Centroids, cluster); 
        new_clusters.remove(0);
        
        for(ArrayList<POINT> new_cluster : new_clusters){
            clusters.add(new_cluster);
        }
        return clusters;
    }

    public static ArrayList<POINT> calculate_centers(ArrayList<ArrayList<POINT>> clusters, int k){
        ArrayList<POINT> centers = new ArrayList<>();

        for(ArrayList<POINT> cluster : clusters){
            if(k == 1 || k == 3){
                centers.add(calculate_Centroid(cluster));
            }else{
                centers.add(calculate_Medoid(cluster));
            }
        }

        return centers;
    }

    public static POINT calculate_Centroid(ArrayList<POINT> cluster) {
        int Points = cluster.size();

        if(cluster.size() == 0){
            return new POINT((int)(Math.random() * 10000 - 5000), (int)(Math.random() * 10000 - 5000));
        }

        int sumX = 0, sumY = 0;

        for (POINT point : cluster) {
            sumX += point.getX();
            sumY += point.getY();
        }

        int X = sumX / Points;
        int Y = sumY / Points;

        return new POINT(X, Y);
    }

    public static POINT calculate_Medoid(ArrayList<POINT> cluster) {
        if(cluster.size() == 0){
            return new POINT((int)(Math.random() * 10000 - 5000), (int)(Math.random() * 10000 - 5000));
        }

        POINT Medoid = new POINT();
        double min_total_distance = 1000000000;

        for (POINT candidate : cluster) {
            double total_distance = 0;
            for (POINT point : cluster) {
                total_distance += calculate_distance(candidate, point);
            }
            if (total_distance < min_total_distance) {
                min_total_distance = total_distance;
                Medoid = candidate;
            }
        }

        return Medoid;
    }

    public static ArrayList<ArrayList<POINT>> sort_points(ArrayList<POINT> Centers, ArrayList<POINT> Points){
        int index = 0;
        ArrayList<ArrayList<POINT>> clusters = new ArrayList<>();

        for(POINT center : Centers){
            ArrayList<POINT> Cluster = new ArrayList<>();
            Cluster.add(center);
            clusters.add(Cluster);
        }

        for(POINT Point : Points){
            index = find_nearest_center(Centers, Point);
            clusters.get(index).add(Point);
        }

        for(ArrayList<POINT> cluster : clusters){
            cluster.remove(0);
        }

        return clusters;
    }

    public static int find_nearest_center(ArrayList<POINT> Centers, POINT point){
        int index = 0; 
        double distance = 0;
        double lowest_distance = calculate_distance(point, Centers.get(0));

        for(int i = 1; i < Centers.size(); i++){
            distance = calculate_distance(point, Centers.get(i));
            if(distance < lowest_distance){
                lowest_distance = distance;
                index = i;
            }
        }

        return index;
    }

    public static double calculate_distance(POINT point1, POINT point2){
        double distance = 0;
        double x1 = point1.getX(), y1 = point1.getY();
        double x2 = point2.getX(), y2 = point2.getY();

        distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        return distance;
    }

    public static void check_success(ArrayList<ArrayList<POINT>> clusters ,ArrayList<POINT> Centers, int points){
        DecimalFormat decimalFormat = new DecimalFormat("#.##");
        DecimalFormat decimalFormat0 = new DecimalFormat("#");
        double success = 0, count = clusters.size();
        double average_distance = 0;
        
        System.out.println("Number of clusters: " + count);
        System.out.println("Number of points: " + points);
        
        for(int i = 0; i < count; i++){
            POINT center = Centers.get(i);
            ArrayList<POINT> cluster = clusters.get(i);
            double distance = calculate_average_distance_from_center(center, cluster);
            average_distance += distance;
            if(distance > 500){
                System.out.println("\n!!! UNSUCCESSFUL CLUSTER !!!");
            }else{
                System.out.println("\n --- SUCCESSFUL CLUSTER ---");
                success++;
            }
            System.out.println("Cluster number: " + (i+1));
            System.out.println("Center coordinates: X = " + decimalFormat.format(center.getX()) + " Y = " + decimalFormat.format(center.getY()));
            System.out.println("Distance: " + decimalFormat.format(distance));
            System.out.println("Number of points: " + cluster.size());
        }

        System.out.println("\nSuccessful clusters: " + decimalFormat0.format(success) + "/" + decimalFormat0.format(count));
        System.out.println("Success rate: " + decimalFormat0.format(((success/count)*100)) + "%");
        System.out.println("Average distance: " + decimalFormat.format(((average_distance/count))));
        
    }

    public static ArrayList<POINT> generate_points(int k, Boolean start) {
        ArrayList<POINT> Points = new ArrayList<>();

        while (Points.size() < k) {
            int x = (int) (Math.random() * 10000 - 5000);
            int y = (int) (Math.random() * 10000 - 5000);

            POINT newPoint = new POINT(x, y);

            if (!Points.contains(newPoint)) {
                Points.add(newPoint);
            }
        }

        if(start){
            generate_40k(Points);
            ArrayList<ArrayList<POINT>> points =  new ArrayList<>();
            points.add(Points);
        }

        return Points;
    }

    public static ArrayList<POINT> generate_40k(ArrayList<POINT> Points) {
        for (int i = 0; i < 40000; i++) {
            POINT randomPoint = Points.get((int) (Math.random() * Points.size()));
            int x_offset = (int) (Math.random() * 200 - 100);
            int y_offset = (int) (Math.random() * 200 - 100);
            int new_x = randomPoint.getX() + x_offset;
            int new_y = randomPoint.getY() + y_offset;

            if(new_x > 5000){
                new_x = 5000;
            }
            if(new_y > 5000){
                new_y = 5000;
            }
            if(new_x < -5000){
                new_x = -5000;
            }
            if(new_y < -5000){
                new_y = -5000;
            }

            POINT newPoint = new POINT(new_x, new_y);
            Points.add(newPoint);
        }

        return Points;
    }
}
