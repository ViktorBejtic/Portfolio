public class NODE {
    String[][] map;
    String last_used_op;
    int depth;
    NODE parent;

    NODE() {

    }

    NODE(int depth) {
        this.depth = depth;
    }

    String[][] getMap() {
        return this.map;
    }

    void setMap(String[][] map) {        
        this.map = map;
    }

    String getLast_used_op() {
        return this.last_used_op;
    }

    void setLast_used_op(String last_used_op) {
        this.last_used_op = last_used_op;
    }

    int getDepth() {
        return this.depth;
    }

    void setDepth(int depth) {
        this.depth = depth;
    }

}