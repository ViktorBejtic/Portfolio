import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Random;

public class App {
    public static void main(String[] args) throws Exception {
        ArrayList<TOWN> tour = TownGenerator(40, 200);

        System.out.println("\nStarting Fitness: " + TSP.CalculateFitness(tour));

        TSP.SimulatedAnnealing(tour);
        TSP.TabuSearch(tour);

        PlotGraphs();

    }

    public static ArrayList<TOWN> TownGenerator(int number_of_cities, int grid_size){
        ArrayList<TOWN> tour = new ArrayList<TOWN>();
        Random random = new Random();
        HashSet<String> usedPositions = new HashSet<>();
        for(int i = 1; i <= number_of_cities; i++){
            TOWN town = new TOWN(i);

            int x, y;
            String position;
            do {
                x = random.nextInt(grid_size);
                y = random.nextInt(grid_size);
                position = x + "," + y;
            } while (usedPositions.contains(position));
            
            town.setXY(x, y);
            usedPositions.add(position);
            tour.add(town);
        }

        Collections.shuffle(tour);

        JavaToPython.javaToPython(tour, "Non");
        return tour;
    }

    public static void PlotGraphs(){
        try {
            ProcessBuilder processBuilder = new ProcessBuilder("python3", "src/GraphPlot.py");

            Process process = processBuilder.start();

            int exitCode = process.waitFor();
            System.out.println("Python script finished with exit code: " + exitCode);

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

}


