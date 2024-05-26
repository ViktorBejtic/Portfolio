import java.util.ArrayList;

public class NODE {
    String bfunkcia;
    ArrayList<String> sortedfunc;
    char var;
    char value;
    NODE left;
    NODE right;

    NODE() {

    }

    NODE(char value) {
        this.value = value;
    }

    void setBF(String bfunkcia) {
        this.bfunkcia = bfunkcia;
    }

    void setSortedBF(ArrayList<String> sortedfunc) {
        this.sortedfunc = sortedfunc;
    }

    void setValue(char value) {
        this.value = value;
    }

    void setVar(char var) {
        this.var = var;
    }

    String getBF() {
        return this.bfunkcia;
    }

    ArrayList<String> getSortedBF() {
        return this.sortedfunc;
    }

    char getValue() {
        return this.value;
    }

    char getVar() {
        return this.var;
    }
}
