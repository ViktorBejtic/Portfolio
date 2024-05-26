import java.util.ArrayList;
import java.util.HashMap;

public class IDS {

    public static int find_size(String[][] map, String color, String orientation){
        if(orientation == "vertically"){
            for (int i = 0; i < map.length; i++) {
                for (int j = 0; j < map[0].length; j++) {
                    if(map[i][j] == color){
                        if(i < 4 && map[i+2][j] == color){
                            return 3;
                        }else{
                            return 2;
                        }
                    }
                }
            }
        }else{
            for (int i = 0; i < map.length; i++) {
                for (int j = 0; j < map[0].length; j++) {
                    if(map[i][j] == color){
                        if(j < 4 && map[i][j+2] == color){
                            return 3;
                        }else{
                            return 2;
                        }
                    }
                }
            }
        }
        return 0;
    }

    public static String find_orientation(String[][] map, String color){
        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == color){
                    if(i != 0 && map[i-1][j] == color){
                        return "vertically";
                    }
                    if(i != map.length - 1 && map[i+1][j] == color){
                        return "vertically";
                    }
                    if(j != 0 && map[i][j-1] == color){
                        return "horizontally";
                    }
                    if(j != map[0].length - 1 && map[i][j+1] == color){
                        return "horizontally";
                    }
                      
                }
            }
        }
        return "error";
    }

    public static boolean check_if_win(NODE node){
        String[][] map = node.getMap();

        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == "red"){
                    if(j == 5){
                        ArrayList<String> path_to_win = new ArrayList<String>();
                        System.out.println("\nCorrect solution was found in depth: " + node.getDepth());
                        System.out.println("Path to the correct solution:");
                        while(node.parent != null){
                            path_to_win.add(0 , node.getLast_used_op());
                            node = node.parent;
                        }
                        for(int g = 0; g < path_to_win.size(); g++){
                            System.out.println(path_to_win.get(g));
                        }
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public static boolean check_possibility(String[][] map){
        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == "red"){
                    int distance_from_win = 6 - j;
                    for(int n = 0; n < distance_from_win; n++){
                        if(map[i][j+n] != "red" && map[i][j+n] != "empty"){
                            if(find_orientation(map, map[i][j+n]) == "horizontally"){
                                return false;
                            }
                        }
                    }
                    return true;
                }
            }
        }
        return true;
    }

    public static ArrayList<String> map_to_arraylist(String[][] map){
        ArrayList<String> map_string = new ArrayList<String>();
        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                map_string.add(map[i][j]);
            }
        }
        return map_string;
    }

    public static ArrayList<String> colors_from_map(String[][] map){
        ArrayList<String> colors = new ArrayList<String>();
        String color = new String();
        
        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] != "empty"){
                    color = map[i][j];
                    if(colors.size() == 0){
                        colors.add(color);
                    }
                    for(int g = 0; g < colors.size(); g++){
                        if(color == colors.get(g)){
                            break;
                        }
                        if(g == colors.size() - 1){
                            colors.add(color);
                        }
                    }
                }
            }
        }

        return colors;
    }

    public static void Iterative_Deepening_Search(NODE root, String [][] map, int maxdepth){
        int index = 0;
        int size = 0;
        ArrayList<String> colors = colors_from_map(map);
        
        
        if(!check_possibility(map)){
            System.out.println("\nThere is no solution for this puzzle");
            return;
        }

        check_if_win(root);

        for(int depth = 1; depth <= maxdepth; depth++){
            ArrayList<NODE> edge = new ArrayList<NODE>();
            root = new NODE(0);
            root.setMap(map);
            edge.add(root);
            HashMap<ArrayList<String>, String[][]> HashMap = new HashMap<ArrayList<String>, String[][]>();
            ArrayList<String> map_string = map_to_arraylist(map);
            HashMap.put(map_string, map);

            while(edge.size() != 0){

                root = edge.get(0);
                index = 0; 
            
                while(index != colors.size()){
                    NODE node = new NODE(root.getDepth()+1);
                    if(node.getDepth() > depth){
                        break;
                    }

                    String color = colors.get(index);
                    String orientation = find_orientation(map, color);
                    size = find_size(map, color, orientation);
                    
                    if(orientation == "vertically"){
                        move_vertically(root.getMap(), HashMap, color, node, size);
                    }else{
                        move_horizontally(root.getMap(), HashMap, color, node, size); 
                    }
                    if(node.getLast_used_op() == null){
                        index++;
                    }else{
                        edge.add(node);
                        node.parent = root;
                        if(check_if_win(node)){
                            return;
                        }
                    }
                }
                edge.remove(0); 
            }
            
        }

        System.out.println("\nNo solution found in max depth: " + maxdepth);
    }

    public static void move_vertically(String[][] map, HashMap<ArrayList<String>, String[][]> HashMap, String color, NODE node, int size){
        int end = 0;
        String move = new String();
        String [][] new_map = new String[map.length][map[0].length];
        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == color){
                    end = 1;
                    if(i == 0){
                        int original_i = i;
                        i+=size-1;
                        int distance_from_border = 6 - i;
                        for(int d = 1; d < distance_from_border; d++){
                            if(map[i+d][j] == "empty"){
                                move = "DOWN, " + color + ", " + original_i + " " + j + ", " + d;
                                new_map = move_down(copy_map(map), color, size, d);
                                ArrayList<String> map_string = map_to_arraylist(new_map);
                                if(!HashMap.containsKey(map_string)){
                                    node.setMap(new_map);
                                    node.setLast_used_op(move);
                                    HashMap.put(map_string, new_map);
                                    return;
                                }
                            }else{
                                return;
                            }
                        }
                    
                    }else if(i == 6-size){
                        int distance_from_border = i+1;
                        for(int d = 1; d < distance_from_border; d++){
                            if(map[i-d][j] == "empty"){
                                move = "UP, " + color + ", " + i + " " + j + ", " + d;
                                new_map = move_up(copy_map(map), color, size, d);
                                ArrayList<String> map_string = map_to_arraylist(new_map);
                                if(!HashMap.containsKey(map_string)){
                                    node.setMap(new_map);
                                    node.setLast_used_op(move);
                                    HashMap.put(map_string, new_map);
                                    return;
                                }
                            }else{
                                return;
                            }
                        }
                    }else{
                        int distance_from_border = i+1;
                        for(int d = 1; d < distance_from_border; d++){
                            if(map[i-d][j] == "empty"){
                                move = "UP, " + color + ", " + i + " " + j + ", " + d;
                                new_map = move_up(copy_map(map), color, size, d);
                                ArrayList<String> map_string = map_to_arraylist(new_map);
                                if(!HashMap.containsKey(map_string)){
                                    node.setMap(new_map);
                                    node.setLast_used_op(move);
                                    HashMap.put(map_string, new_map);
                                    return;
                                }

                            }else{
                                break;
                            }
                        }
                        int original_i = i;
                        i+=size-1;
                        distance_from_border = 6 - i;
                        for(int d = 1; d < distance_from_border; d++){
                            if(map[i+d][j] == "empty"){
                                move = "DOWN, " + color + ", " + original_i + " " + j + ", " + d;
                                new_map = move_down(copy_map(map), color, size, d);
                                ArrayList<String> map_string = map_to_arraylist(new_map);
                                if(!HashMap.containsKey(map_string)){
                                    node.setMap(new_map);
                                    node.setLast_used_op(move);
                                    HashMap.put(map_string, new_map);
                                    return;
                                }
                            }else{
                                return;
                            }
                        }
                    }
                }
            }
            if(end == 1){
                return;
            }
        }
    }
    
    public static void move_horizontally(String[][] map, HashMap<ArrayList<String>, String[][]> HashMap, String color, NODE node, int size){
        int end = 0;
        String move = new String();
        String [][] new_map = new String[map.length][map[0].length];
        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == color){
                    end = 1;
                    if(j == 0){
                        int original_j = j;
                        j+=size-1;
                        int distance_from_border = 6 - j;
                        for(int d = 1; d < distance_from_border; d++){
                            if(map[i][j+d] == "empty"){
                                move = "RIGHT, " + color + ", " + i + " " + original_j + ", " + d;
                                new_map = move_right(copy_map(map), color, size, d);
                                ArrayList<String> map_string = map_to_arraylist(new_map);
                                if(!HashMap.containsKey(map_string)){
                                    node.setMap(new_map);
                                    node.setLast_used_op(move);
                                    HashMap.put(map_string, new_map);
                                    return;
                                }
                                
                            }else{
                                return;
                            }
                        }
                    }else if(j == 6-size){
                        int distance_from_border = j+1;
                        for(int d = 1; d < distance_from_border; d++){
                            if(map[i][j-d] == "empty"){
                                move = "LEFT, " + color + ", " + i + " " + j + ", " + d;
                                new_map = move_left(copy_map(map), color, size, d);
                                ArrayList<String> map_string = map_to_arraylist(new_map);
                                if(!HashMap.containsKey(map_string)){
                                    node.setMap(new_map);
                                    node.setLast_used_op(move);
                                    HashMap.put(map_string, new_map);
                                    return;
                                }
                            }else{
                                return;
                            }
                        }
                    }else{
                        int distance_from_border = j+1;
                        for(int d = 1; d < distance_from_border; d++){
                            if(map[i][j-d] == "empty"){
                                move = "LEFT, " + color + ", " + i + " " + j + ", " + d;
                                new_map = move_left(copy_map(map), color, size, d);     
                                ArrayList<String> map_string = map_to_arraylist(new_map);                           
                                if(!HashMap.containsKey(map_string)){
                                    node.setMap(new_map);
                                    node.setLast_used_op(move);
                                    HashMap.put(map_string, new_map);
                                    return;
                                }
                            }else{
                                break;
                            }
                        }
                        int original_j = j;
                        j+=size-1;
                        distance_from_border = 6 - j;
                        for(int d = 1; d < distance_from_border; d++){
                            if(map[i][j+d] == "empty"){
                                move = "RIGHT, " + color + ", " + i + " " + original_j + ", " + d;
                                new_map = move_right(copy_map(map), color, size, d);
                                ArrayList<String> map_string = map_to_arraylist(new_map);
                                if(!HashMap.containsKey(map_string)){
                                    node.setMap(new_map);
                                    node.setLast_used_op(move);
                                    HashMap.put(map_string, new_map);
                                    return;
                                }
                            }else{
                                return;
                            }
                        }
                    }
                }
                if(end == 1){
                    return;
                }
            }
        }
    }

    public static String[][] move_right(String[][] map, String color, int size, int distance){
        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == color){
                    j+=size-1;
                    for(int g = 1; g <= distance; g++){
                        map[i][j+g] = color;
                    }
                    j=(j+distance)-(size-1);
                    for(int g = 1; g <= distance; g++){
                        map[i][j-g] = "empty";
                    }
                    return map;
                }
            }
        }

        return map;
    }

    public static String[][] move_left(String[][] map, String color, int size, int distance){
        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == color){
                    for(int g = 1; g <= distance; g++){
                        map[i][j-g] = color;
                    }
                    j=(j-distance)+(size-1);
                    for(int g = 1; g <= distance; g++){
                        map[i][j+g] = "empty";
                    }
                    return map;
                }
            }
        }

        return map;
    }

    public static String[][] move_up(String[][] map, String color, int size, int distance){
        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == color){
                    for(int g = 1; g <= distance; g++){
                        map[i-g][j] = color;
                    }
                    i=(i-distance)+(size-1);
                    for(int g = 1; g <= distance; g++){
                        map[i+g][j] = "empty";
                    }
                    return map;
                }
            }
        }
        return map;
    }

    public static String[][] move_down(String[][] map, String color, int size, int distance){
        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == color){
                    i+=size-1;
                    for(int g = 1; g <= distance; g++){
                        map[i+g][j] = color;
                    }
                    i=(i+distance)-(size-1);
                    for(int g = 1; g <= distance; g++){
                        map[i-g][j] = "empty";
                    }
                    return map;
                }
            }
        }
        return map;
    }

    public static String[][] copy_map(String[][] map){
        String [][] new_map = new String[map.length][map[0].length];
        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                new_map[i][j] = map[i][j];
            }
        }
        return new_map;
    }

}