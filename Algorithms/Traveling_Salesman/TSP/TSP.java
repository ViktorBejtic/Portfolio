import java.util.ArrayList;
import java.util.Collections;
import java.util.Random;

public class TSP {
    public static void TabuSearch(ArrayList<TOWN> tour){
        ArrayList<ArrayList<TOWN>> tabu_list = new ArrayList<ArrayList<TOWN>>();
        double fitness = CalculateFitness(tour);
        double best_fitness = fitness;
        double best_worse_fitness = 1000000000;
        ArrayList<TOWN> best_worse_tour = tour;
        ArrayList<TOWN> best_tour = tour;
        int found = 0;
        int worse = 0;
        int tabu = 0;

        while(worse < 100){
            ArrayList<ArrayList<TOWN>> tour_children = CreateChildren(tour);
            found = 0;

            for(int i = 0; i < tour_children.size(); i++){
                ArrayList<TOWN> tour_child = tour_children.get(i);
                double child_fitness = CalculateFitness(tour_child);
                tabu = 0;
                if(child_fitness < fitness){
                    best_fitness = child_fitness;
                    best_tour = tour_child;
                    for(int j = 0; j < tabu_list.size(); j++){
                        if(tour_child.equals(tabu_list.get(j))){
                            tabu = 1;
                            break;
                        }
                    }
                    if(tabu == 0){
                        tour = tour_child;
                        fitness = child_fitness;
                        worse = 0;
                        found = 1;
                        break;
                    }
                }else{
                    if(child_fitness < best_worse_fitness){
                        best_worse_fitness = child_fitness;
                        best_worse_tour = tour_child;
                    }
                }
            }

            if(found == 0){
                worse++;
                tabu_list.add(tour);
                tour = best_worse_tour;
            }

            if(tabu_list.size() > 50){
                tabu_list.remove(0);
            }
        }

        tour = best_tour;
        fitness = best_fitness;

        JavaToPython.javaToPython(tour, "TabuSearch");

        System.out.println("\nTabuSearch: ");
        for(int i = 0; i < tour.size(); i++){
            System.out.print(tour.get(i).getNumber() + ", ");
        }
        System.out.printf("\nFitness: %.2f%n", CalculateFitness(tour));

    }

    public static void SimulatedAnnealing(ArrayList<TOWN> tour){
        Random random = new Random();
        double fitness = CalculateFitness(tour);
        double temperature = 45;
        int iteration = 1;
        int found = 0;

        while(temperature > 0.25){
            ArrayList<ArrayList<TOWN>> tour_children = CreateChildren(tour);
            found = 0;

            for(int i = 0; i < tour_children.size(); i++){
                ArrayList<TOWN> tour_child = tour_children.get(i);
                double child_fitness = CalculateFitness(tour_child);

                if(child_fitness < fitness){
                    tour = tour_child;
                    fitness = child_fitness;
                    found = 1;
                    break;
                }else{
                    if((random.nextDouble() * 100) < temperature){
                        tour = tour_child;
                        fitness = child_fitness;
                        found = 1;
                        break;
                    }
                }
            }

            if(found == 0){
                temperature = 0;
            }

            if(iteration % 10 == 0){
                temperature = temperature * 0.95;
            }

            iteration++;
        }

        JavaToPython.javaToPython(tour,"SimulatedAnnealing");
        System.out.println("\nSimulatedAnnealing: ");
        for(int i = 0; i < tour.size(); i++){
            System.out.print(tour.get(i).getNumber() + ", ");
        }
        System.out.printf("\nFitness: %.2f%n", CalculateFitness(tour));

    }

    public static double CalculateFitness(ArrayList<TOWN> tour){
        double fitness = 0;
        int x1 = 0, x2 = 0, y1 = 0, y2 = 0;

        for(int i = 0; i < tour.size(); i++){
            x1 = tour.get(i).getX();
            y1 = tour.get(i).getY();
            if(i+1 == tour.size()){
                x2 = tour.get(0).getX();
                y2 = tour.get(0).getY();
            }else{
                x2 = tour.get(i+1).getX();
                y2 = tour.get(i+1).getY();
            }
            fitness += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }

        return fitness;
    }

    public static ArrayList<ArrayList<TOWN>> CreateChildren(ArrayList<TOWN> tour){
        ArrayList<ArrayList<TOWN>> tour_children = new ArrayList<ArrayList<TOWN>>();

        for(int i = 0; i < tour.size(); i++){
            for(int j = 0; j < tour.size(); j++){
                ArrayList<TOWN> tour_child = new ArrayList<TOWN>(tour);
                Collections.swap(tour_child, i, j);

                if(i != j){
                    int duplicate = 0;
                    for(int k = 0; k < tour_children.size(); k++){
                        if(tour_child.equals(tour_children.get(k))){
                            duplicate = 1;
                            break;
                        }
                    }
                    if(duplicate == 0){
                        tour_children.add(tour_child);
                    }
                }
            }
        }

        return tour_children;
    }

}
