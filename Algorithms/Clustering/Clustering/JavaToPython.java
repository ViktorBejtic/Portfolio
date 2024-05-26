import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;

public class JavaToPython {
    public static void write_clusters(ArrayList<ArrayList<POINT>> clusters, String name){
        try (FileWriter writer = new FileWriter(name+".csv")) {
            for(ArrayList<POINT> cluster : clusters){
                for (POINT point : cluster) {
                    String x = Double.toString(point.getX());
                    String y = Double.toString(point.getY());
                    writer.append(x+","+y);
                    writer.append('\n');
                }
                writer.append("5555,5555");
                writer.append('\n');
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void write_centers(ArrayList<POINT> centers, String name){
        try (FileWriter writer = new FileWriter(name+".csv")) {
            for (POINT center : centers) {
                String x = Double.toString(center.getX());
                String y = Double.toString(center.getY());
                writer.append(x+","+y);
                writer.append('\n');
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void start_python(){
        try {
            ProcessBuilder graph_plot = new ProcessBuilder("python3", "src/GraphPlot.py");
            Process process = graph_plot.start();

            int exitCode = process.waitFor();
            System.out.println("Python script finished with exit code: " + exitCode);

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
