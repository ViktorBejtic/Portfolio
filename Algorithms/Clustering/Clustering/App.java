import java.util.Scanner;

public class App {
    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        boolean fail = true;
        
        while(fail){
            System.out.println("\nPlease choose clusterer:");
            System.out.println("\n1 = K-means clustering" +
                               "\n2 = Divisive clustering");
            System.out.print("\nEnter number: ");
            String clusterer = scanner.nextLine();

            switch(clusterer){
                case "1":
                    System.out.println("\nHow many clusters do you want?");
                    System.out.print("\nEnter number: ");
                    int k = Integer.parseInt(scanner.nextLine());

                    System.out.println("\nPlease choose cluster center:");
                    System.out.println("\n1 = Centroid" +
                                       "\n2 = Medoid");
                    System.out.print("\nEnter number: ");
                    String cluster_center = scanner.nextLine();

                    switch (cluster_center) {
                        case "1":
                            Clusterer.setup(1, k);
                            fail = false;
                            break;

                        case "2":
                            Clusterer.setup(2, k);
                            fail = false;
                            break;
                    
                        default:
                            System.out.println("\nYou entered the wrong number. Please try again.");
                            break;
                    }
                    break;

                case "2":
                    Clusterer.setup(3, 0);
                    fail = false;
                    break;

                default:
                    System.out.println("\nYou entered the wrong number. Please try again.");
                    break;
            }
        }   
        scanner.close();
    }
}
