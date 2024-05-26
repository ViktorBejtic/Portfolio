import java.util.ArrayList;

public class BDD {
    NODE root;
    int varcount, nodecount;
    double reduction, ROBDDreduction;
    String bfunkcia, poradie;
    ArrayList<String> funclist;

    void setVarcount(int varcount) {
        this.varcount = varcount;
    }

    void setNodecount(int nodecount) {
        this.nodecount = nodecount;
    }

    void setReduction(double reduction) {
        this.reduction = reduction;
    }

    void setROBDDReduction(double ROBDDreduction) {
        this.ROBDDreduction = ROBDDreduction;
    }

    void setBfunkcia(String bfunkcia) {
        this.bfunkcia = bfunkcia;
    }

    void setPoradie(String poradie) {
        this.poradie = poradie;
    }

    void setFunclist(ArrayList<String> funclist) {
        this.funclist = funclist;
    }

    int getVarcount() {
        return this.varcount;
    }

    int getNodecount() {
        return this.nodecount;
    }

    double getReduction() {
        return this.reduction;
    }

    double getROBDDReduction() {
        return this.ROBDDreduction;
    }

    String getBfunkcia() {
        return this.bfunkcia;
    }

    String getPoradie() {
        return this.poradie;
    }

    ArrayList<String> getFunclist() {
        return this.funclist;
    }
}
