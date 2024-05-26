
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;

public class JavaToPython {
    public static void javaToPython(ArrayList<TOWN> tour, String name) {

        try (FileWriter writer = new FileWriter(name+"_data.csv")) {
            for (TOWN value : tour) {
                String x = Integer.toString(value.getX());
                String y = Integer.toString(value.getY());
                writer.append(x+","+y);
                writer.append('\n');
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

