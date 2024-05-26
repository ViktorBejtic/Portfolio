public class POINT implements Comparable<POINT>{
    int x;
    int y;

    POINT(){}

    POINT(int x, int y){
        this.x = x;
        this.y = y;
    }

    int getX(){
        return this.x;
    }

     int getY(){
        return this.y;
    }

    @Override
    public int compareTo(POINT other) {
        if (this.x != other.x) {
            return Integer.compare(this.x, other.x);
        } else {
            return Integer.compare(this.y, other.y);
        }
    }
}
