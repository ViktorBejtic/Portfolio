public class TOWN {
    int number;
    int x;
    int y;
    boolean checked;

    TOWN(){}

    TOWN(int number){
        this.number = number;
    }

    int getNumber(){
        return this.number;
    }

    void setNumber(int number){
        this.number = number;
    }

    int getX(){
        return this.x;
    }

    void setX(int x){
        this.x = x;
    }

     int getY(){
        return this.y;
    }

    void setY(int y){
        this.y = y;
    }

    void setXY(int x, int y){
        this.x = x;
        this.y = y;
    }

    boolean get_checked(){
        return this.checked;
    }

    void set_checked(boolean checked){
        this.checked = checked;
    }

}
