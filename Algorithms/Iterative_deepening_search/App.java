
public class App {
    public static void main(String[] args) throws Exception {
        String[][] map = new String[6][6];

        // map = zadanie_map(); //8
        // map = case1_map(); //6
        // map = case2_map(); //impossible
        // map = case3_map(); //15 
        // map = case4_map(); //18
        map = case5_map(); //36


        NODE root = new NODE(0);
        root.setMap(map);

        IDS.Iterative_Deepening_Search(root, map, 100);
    }

    public static String[][] zadanie_map(){
        String[][] map = new String[6][6];

        map[0][0] = "orange";
        map[0][1] = "orange";
        map[1][0] = "yellow";
        map[2][0] = "yellow";
        map[3][0] = "yellow";
        map[4][0] = "pink";
        map[5][0] = "pink";
        map[2][1] = "red";
        map[2][2] = "red";
        map[1][3] = "green";
        map[2][3] = "green";
        map[3][3] = "green";
        map[4][4] = "grey";
        map[4][5] = "grey";
        map[0][5] = "purple";
        map[1][5] = "purple";
        map[2][5] = "purple";
        map[5][2] = "blue";
        map[5][3] = "blue";
        map[5][4] = "blue";

        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == null){
                    map[i][j] = "empty";
                }
            }
        }

        return map;
    }

    public static String[][] case1_map(){
        String[][] map = new String[6][6];

        map[0][0] = "orange";
        map[1][0] = "orange";
        map[0][1] = "yellow";
        map[0][2] = "yellow";
        map[0][3] = "yellow";
        map[2][0] = "pink";
        map[3][0] = "pink";
        map[3][1] = "red";
        map[3][2] = "red";
        map[1][3] = "green";
        map[2][3] = "green";
        map[3][3] = "green";
        map[3][5] = "grey";
        map[4][5] = "grey";
        map[0][4] = "purple";
        map[1][4] = "purple";
        map[2][4] = "purple";
        map[5][3] = "blue";
        map[5][4] = "blue";
        map[5][5] = "blue";

        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == null){
                    map[i][j] = "empty";
                }
            }
        }

        return map;
    }

    public static String[][] case2_map(){
        String[][] map = new String[6][6];

        map[0][0] = "orange";
        map[1][0] = "orange";
        map[0][1] = "yellow";
        map[0][2] = "yellow";
        map[0][3] = "yellow";
        map[2][0] = "pink";
        map[3][0] = "pink";
        map[3][1] = "red";
        map[3][2] = "red";
        map[1][3] = "green";
        map[2][3] = "green";
        map[3][3] = "green";
        map[3][5] = "grey";
        map[4][5] = "grey";
        map[0][4] = "purple";
        map[1][4] = "purple";
        map[2][4] = "purple";
        map[3][4] = "blue";
        map[4][4] = "blue";
        map[5][4] = "blue";

        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == null){
                    map[i][j] = "empty";
                }
            }
        }

        return map;
    }

    public static String[][] case3_map(){
        String[][] map = new String[6][6];

        map[2][5] = "orange";
        map[3][5] = "orange";
        map[1][4] = "yellow";
        map[2][4] = "yellow";
        map[3][4] = "yellow";
        map[4][1] = "pink";
        map[5][1] = "pink";
        map[2][0] = "red";
        map[2][1] = "red";
        map[1][2] = "green";
        map[2][2] = "green";
        map[5][4] = "grey";
        map[5][5] = "grey";
        map[3][0] = "purple";
        map[3][1] = "purple";
        map[3][2] = "purple";
        map[4][2] = "blue";
        map[5][2] = "blue";
        map[4][0] = "white";
        map[5][0] = "white";
        map[4][4] = "cyan";
        map[4][5] = "cyan";

        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == null){
                    map[i][j] = "empty";
                }
            }
        }

        return map;
    }

    public static String[][] case4_map(){
        String[][] map = new String[6][6];

        map[0][2] = "orange";
        map[1][2] = "orange";
        map[1][3] = "yellow";
        map[1][4] = "yellow";
        map[1][5] = "yellow";
        map[2][4] = "pink";
        map[3][4] = "pink";
        map[2][2] = "red";
        map[2][3] = "red";
        map[4][5] = "green";
        map[5][5] = "green";
        map[4][0] = "grey";
        map[4][1] = "grey";
        map[4][2] = "purple";
        map[4][3] = "purple";
        map[4][4] = "purple";
        map[1][0] = "blue";
        map[2][0] = "blue";
        map[0][0] = "cyan";
        map[0][1] = "cyan";

        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == null){
                    map[i][j] = "empty";
                }
            }
        }

        return map;
    }

    public static String[][] case5_map(){
        String[][] map = new String[6][6];

        map[0][4] = "orange";
        map[1][4] = "orange";
        map[0][3] = "yellow";
        map[1][3] = "yellow";
        map[2][3] = "yellow";
        map[2][0] = "pink";
        map[3][0] = "pink";
        map[2][1] = "red";
        map[2][2] = "red";
        map[3][2] = "blue";
        map[4][2] = "blue";
        map[5][2] = "blue";
        map[5][0] = "grey";
        map[5][1] = "grey";
        map[2][5] = "purple";
        map[3][5] = "purple";
        map[4][5] = "purple";
        map[0][5] = "aqua";
        map[1][5] = "aqua";
        map[0][0] = "white";
        map[0][1] = "white";
        map[4][0] = "cyan";
        map[4][1] = "cyan";
        map[3][3] = "magenta";
        map[3][4] = "magenta";

        for (int i = 0; i < map.length; i++) {
            for (int j = 0; j < map[0].length; j++) {
                if(map[i][j] == null){
                    map[i][j] = "empty";
                }
            }
        }

        return map;
    }

}



