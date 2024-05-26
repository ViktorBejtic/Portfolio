import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Collections;

public class App {
    private static int nodecount = 0;
    private static NODE truefunc = new NODE('1');
    private static NODE falsefunc = new NODE('0');

    public static void testROBDD(int n) {
        BDD bdd = new BDD();
        String bfunkcia = new String();
        long start, end, time, totaltime = 0, average;
        double reduction = 0, ROBDDreduction = 0;
        int nodes = 0;
        for (int i = 0; i < 100; i++) {
            bfunkcia = DNFgenerator(n);
            start = System.nanoTime();
            bdd = BDD_create_with_best_order(bfunkcia);
            end = System.nanoTime();
            time = end - start;
            totaltime += time;
            System.out.println(time);
            reduction += bdd.getReduction();
            ROBDDreduction += bdd.getROBDDReduction();
            nodes += bdd.getNodecount();
            if (!correctBDD(bdd, bdd.getFunclist())) {
                System.out.println("Wrong");
            }

        }
        average = totaltime / 100;
        reduction = reduction / 100;
        ROBDDreduction = ROBDDreduction / 100;
        nodes = nodes / 100;
        System.out.println("\nAverage build time: " + average
                + "\nAverage reduction: " + reduction + "%"
                + "\nROBDD reduction: " + ROBDDreduction + "%"
                + "\nAverage nodecount: " + nodes
                + "\nVarcount: " + n);
    }

    public static void testBDD(int n) {
        BDD bdd = new BDD();
        String bfunkcia, poradie = new String();
        long start, end, time, totaltime = 0, average;
        double reduction = 0;
        int nodes = 0;
        for (int i = 0; i < 100; i++) {
            bfunkcia = DNFgenerator(n);
            poradie = poradiehelp(bfunkcia);
            start = System.nanoTime();
            bdd = BDD_create(bfunkcia, poradie);
            end = System.nanoTime();
            time = end - start;
            totaltime += time;
            System.out.println(time);
            reduction += bdd.getReduction();
            nodes += bdd.getNodecount();
            if (!correctBDD(bdd, bdd.getFunclist())) {
                System.out.println("Wrong");
            }

        }
        average = totaltime / 100;
        reduction = reduction / 100;
        nodes = nodes / 100;
        System.out.println("\nAverage build time: " + average
                + "\nAverage reduction: " + reduction + "%"
                + "\nAverage nodecount: " + nodes
                + "\nVarcount: " + n);
    }

    public static BDD BDD_create(String bfunkcia, String poradie) {
        BDD BDD = new BDD();
        NODE root = new NODE();
        double reduction;
        double allnodes;
        HashMap<ArrayList<String>, NODE> HashMap = new HashMap<ArrayList<String>, NODE>();

        ArrayList<String> funclist = new ArrayList<>();
        String[] funcarray = bfunkcia.split("\\+", -1);

        for (int j = 0; j < funcarray.length; j++) {
            funclist.add(funcarray[j]);
        }
        nodecount = 0;
        BDD.setFunclist(funclist);
        root = buildBDD(root, funclist, HashMap, poradie, 0);

        BDD.root = root;
        BDD.setVarcount(poradie.length());
        BDD.setNodecount(HashMap.size() - nodecount);
        BDD.setBfunkcia(bfunkcia);
        BDD.setPoradie(poradie);
        if (BDD.root == truefunc || BDD.root == falsefunc) {
            BDD.setNodecount(1);
        }
        allnodes = Math.pow(2, poradie.length() + 1) - 1;
        reduction = (double) (((allnodes - BDD.getNodecount()) / allnodes) * 100);
        DecimalFormat df = new DecimalFormat("#.##");
        reduction = Double.parseDouble(df.format(reduction - 0.01));
        BDD.setReduction(reduction);
        if (BDD.getNodecount() == 1) {
            BDD.setReduction(100);
        }

        return BDD;
    }

    public static BDD BDD_create_with_best_order(String bfunkcia) {
        BDD bdd = new BDD();
        String poradie = new String();
        int highest = 0;
        double ROBDDreduction = 0;

        Set<Character> uniqueChars = new HashSet<>();
        ArrayList<String> poradia = new ArrayList<>();

        for (int i = 0; i < bfunkcia.length(); i++) {
            char c = bfunkcia.charAt(i);
            if (!Character.isWhitespace(c) && c != '!' && c != '+') {
                uniqueChars.add(c);
            }
        }

        char[] uniqueCharsArray = new char[uniqueChars.size()];
        int index = 0;

        for (char c : uniqueChars) {
            uniqueCharsArray[index++] = c;
        }

        poradie = randomporadie(uniqueCharsArray, poradia);
        bdd = BDD_create(bfunkcia, poradie);
        highest = bdd.getNodecount();

        for (int i = 1; i < poradie.length(); i++) {
            BDD temp = new BDD();
            poradie = randomporadie(uniqueCharsArray, poradia);
            temp = BDD_create(bfunkcia, poradie);
            if (temp.getNodecount() < bdd.getNodecount()) {
                bdd = temp;
            } else if (temp.getNodecount() > highest) {
                highest = temp.getNodecount();
            }
        }
        nodecount = bdd.getNodecount();
        ROBDDreduction = (double) (highest - nodecount);
        ROBDDreduction = (double) (ROBDDreduction / highest);
        ROBDDreduction = ROBDDreduction * 100;
        DecimalFormat df = new DecimalFormat("#.##");
        ROBDDreduction = Double.parseDouble(df.format(ROBDDreduction));
        bdd.setROBDDReduction(ROBDDreduction);

        return bdd;
    }

    public static char BDD_use(BDD bdd, String vstupy) {
        char output = '\uffff', var;
        int index;
        String poradie = sortstring(bdd.getPoradie());

        if (bdd.root == null) {
            return output;
        }

        NODE temp = new NODE();
        temp = bdd.root;

        for (int i = 0; i < bdd.getVarcount(); i++) {
            if (temp.getValue() != '\0') {
                return temp.getValue();
            }
            var = temp.getVar();
            index = poradie.indexOf(var);
            if (vstupy.charAt(index) == '0') {
                temp = temp.left;
            } else {
                temp = temp.right;
            }
        }
        return temp.getValue();
    }

    public static NODE buildBDD(NODE node, ArrayList<String> funclist, HashMap<ArrayList<String>, NODE> HashMap,
            String poradie, int i) {
        for (int j = 0; j < funclist.size(); j++) {
            if (funclist.get(j).equals("1")) {
                return truefunc;
            }
        }

        int index;

        for (int j = 0; j < funclist.size(); j++) {
            index = funclist.get(j).indexOf('1');
            if (index != -1) {
                funclist.set(j, (funclist.get(j).substring(0, index) + funclist.get(j).substring(index + 1)));
            }
            index = funclist.get(j).indexOf('0');
            if (index != -1) {
                funclist.set(j, (funclist.get(j).substring(0, index) + funclist.get(j).substring(index + 1)));
            }
        }

        for (int j = 0; j < funclist.size(); j++) {
            if (funclist.get(j).isEmpty()) {
                funclist.remove(j);
            }
        }
        int size = funclist.size();

        for (int j = 0; j < size; j++) {
            for (int c = 0; c < size; c++) {
                if (j != c && j < size && c < size) {
                    if (funclist.get(j).equals(funclist.get(c))) {
                        funclist.remove(c);
                        size--;
                    }
                }
            }
        }

        String bfunkcia = "";

        for (int j = 0; j < funclist.size(); j++) {
            bfunkcia = bfunkcia + funclist.get(j);
        }

        if (bfunkcia.isEmpty()) {
            return falsefunc;
        }

        node.setBF(bfunkcia);

        ArrayList<String> sortedfunc = hashsortstring(funclist);

        node.setSortedBF(sortedfunc);

        if (HashMap.containsKey(sortedfunc)) {
            node = HashMap.get(sortedfunc);
            return node;
        } else {
            node.setSortedBF(sortedfunc);
            HashMap.put(node.getSortedBF(), node);
        }

        ArrayList<String> leftfunc, rightfunc = new ArrayList<>();

        leftfunc = decompose(node, funclist, poradie, i, 0);
        rightfunc = decompose(node, funclist, poradie, i, 1);

        NODE left = new NODE();
        NODE right = new NODE();
        node.left = buildBDD(left, leftfunc, HashMap, poradie, i + 1);
        node.right = buildBDD(right, rightfunc, HashMap, poradie, i + 1);

        if (node.left == node.right) {
            node = node.left;
            nodecount++;
        }

        return node;
    }

    public static ArrayList<String> decompose(NODE node, ArrayList<String> funclist, String poradie, int j,
            int number) {
        int index, count = 0;
        char var = poradie.charAt(j);
        count = funclist.size();

        ArrayList<String> array = new ArrayList<>();

        if (number == 0) {
            for (int i = 0; i < count; i++) {
                index = funclist.get(i).indexOf(var);
                if (index != -1) {
                    if (funclist.get(i).length() == 2) {
                        if (funclist.get(i).charAt(0) == '!') {
                            array.add("1");
                            return array;
                        }
                    }
                }
            }
        }

        for (int i = 0; i < count; i++) {
            array.add(compare(LowerCase(funclist.get(0))));
            funclist.remove(0);
        }

        for (int i = 0; i < count; i++) {
            funclist.add(UpperCase(array.get(0)));
            array.remove(0);
        }

        count = 0;

        for (int i = 0; i < funclist.size(); i++) {
            index = funclist.get(i).indexOf(var);
            if (index != -1) {
                if (number == 1) {
                    if (index - 1 == -1 || funclist.get(i).charAt(index - 1) != '!') {
                        array.add(funclist.get(i));
                    }
                } else {
                    if (index - 1 != -1 && funclist.get(i).charAt(index - 1) == '!') {
                        array.add(funclist.get(i));
                    }
                }
            } else {
                array.add(funclist.get(i));
                count++;
            }
        }

        if (count == funclist.size()) {
            node.setVar(poradie.charAt(j + 1));
            array = decompose(node, funclist, poradie, j + 1, number);
            return array;
        } else {
            node.setVar(poradie.charAt(j));
        }

        for (int i = 0; i < array.size(); i++) {
            index = array.get(i).indexOf(var);
            if (index != -1) {
                if (number == 1) {
                    if (index - 1 == -1 || array.get(i).charAt(index - 1) != '!') {
                        array.set(i,
                                array.get(i).substring(0, index) + '1' + array.get(i).substring(index + 1));
                    }
                } else {
                    if (index - 1 != -1 && array.get(i).charAt(index - 1) == '!') {
                        array.set(i,
                                (array.get(i).substring(0, index) + '0' + array.get(i).substring(index + 1)));
                        array.set(i, (array.get(i).substring(0, index - 1) + array.get(i).substring(index)));
                    }
                }
            }
        }
        return array;
    }

    public static ArrayList<String> hashsortstring(ArrayList<String> funclist) {
        String bfunkcia, sortedStr = new String();
        ArrayList<String> array = new ArrayList<>();
        ArrayList<String> newarray = new ArrayList<>();

        for (int i = 0; i < funclist.size(); i++) {
            array.add(funclist.get(i));
        }

        for (int j = 0; j < array.size(); j++) {
            bfunkcia = LowerCase(array.get(j));

            char[] charArray = bfunkcia.toCharArray();

            Arrays.sort(charArray);

            sortedStr = new String(charArray);
            newarray.add(sortedStr);
        }

        Collections.sort(newarray);

        return newarray;
    }

    public static String sortstring(String bfunkcia) {

        bfunkcia = LowerCase(bfunkcia);

        char[] charArray = bfunkcia.toCharArray();

        Arrays.sort(charArray);

        String sortedStr = new String(charArray);

        return sortedStr;
    }

    public static String LowerCase(String bfunkcia) {
        int index = 0;
        char lowercase;

        while (index != -1) {
            index = bfunkcia.indexOf('!', index);
            if (index != -1) {
                lowercase = bfunkcia.charAt(index + 1);
                lowercase = Character.toLowerCase(lowercase);
                bfunkcia = bfunkcia.substring(0, index + 1) + lowercase + bfunkcia.substring(index + 2);
                bfunkcia = bfunkcia.substring(0, index) + bfunkcia.substring(index + 1);
            }
        }
        return bfunkcia;
    }

    public static String UpperCase(String bfunkcia) {
        char uppercase;

        for (int i = 0; i < bfunkcia.length(); i++) {
            if (Character.isLowerCase(bfunkcia.charAt(i))) {
                uppercase = Character.toUpperCase(bfunkcia.charAt(i));
                bfunkcia = bfunkcia.substring(0, i) + '!' + uppercase + bfunkcia.substring(i + 1);
            }
        }
        return bfunkcia;
    }

    public static String compare(String bfunkcia) {
        char mychar;
        for (int i = 0; i < bfunkcia.length(); i++) {
            for (int j = 0; j < bfunkcia.length(); j++) {
                if (i != j) {
                    if (Character.isLowerCase(bfunkcia.charAt(i))) {
                        mychar = Character.toUpperCase(bfunkcia.charAt(i));
                        if (mychar == bfunkcia.charAt(j)) {
                            bfunkcia = "0";
                            return bfunkcia;
                        }
                    }
                    if (bfunkcia.charAt(i) == bfunkcia.charAt(j)) {
                        bfunkcia = bfunkcia.substring(0, j) + bfunkcia.substring(j + 1);
                    }
                }
            }
        }
        return bfunkcia;
    }

    public static String randomporadie(char[] uniqueCharsArray, ArrayList<String> poradia) {
        String poradie = new String();
        Random rand = new Random();
        boolean newporadie = false, nove = true;

        while (!newporadie) {
            for (int i = uniqueCharsArray.length - 1; i > 0; i--) {
                int j = rand.nextInt(i + 1);
                char temp = uniqueCharsArray[i];
                uniqueCharsArray[i] = uniqueCharsArray[j];
                uniqueCharsArray[j] = temp;
            }
            poradie = String.valueOf(uniqueCharsArray);
            for (int i = 0; i < poradia.size(); i++) {
                if (poradia.get(i).equals(poradie)) {
                    nove = false;
                    break;
                }
            }
            if (nove) {
                poradia.add(poradie);
                newporadie = true;
            }
            nove = true;
        }

        return poradie;
    }

    public static String DNFgenerator(int varcount) {
        int numVars = varcount;
        int maxTerms = numVars;
        int minTerms = maxTerms - 2;

        if (minTerms <= 0) {
            minTerms = 1;
        }

        char[] variables = new char[numVars];
        for (int i = 0; i < numVars; i++) {
            variables[i] = (char) ('A' + i);
        }

        Random rand = new Random();
        int numTerms = rand.nextInt(maxTerms - minTerms + 1) + minTerms;

        List<String> terms = new ArrayList<>();
        for (int i = 0; i < numTerms; i++) {
            int numVarsInTerm = rand.nextInt(numVars) + 1;

            List<String> termVars = new ArrayList<>();
            while (termVars.size() < numVarsInTerm) {
                char var = variables[rand.nextInt(numVars)];
                if (!termVars.contains(String.valueOf(var))) {
                    termVars.add(String.valueOf(var));
                }
            }

            for (int j = 0; j < termVars.size(); j++) {
                if (rand.nextBoolean()) {
                    termVars.set(j, "!" + termVars.get(j));
                }
            }

            String term = String.join("", termVars);
            terms.add(term);
        }

        String dnf = String.join("+", terms);

        return dnf;
    }

    public static boolean correctBDD(BDD bdd, ArrayList<String> funclist) {
        char outcome, USE;
        int length = bdd.getPoradie().length();
        String poradie = bdd.getPoradie();
        String vstupy = new String();
        String zero = "0";
        ArrayList<String> bfunkcia = new ArrayList<>();

        for (int i = 0; i < Math.pow(2, length); i++) {
            vstupy = Integer.toBinaryString(i);
            while (poradie.length() != vstupy.length()) {
                vstupy = zero + vstupy;
            }

            bfunkcia.clear();
            bfunkcia.addAll(funclist);
            outcome = funcoutcome(vstupy, poradie, bfunkcia);
            USE = BDD_use(bdd, vstupy);
            if (outcome != USE) {
                return false;
            }
        }
        return true;
    }

    public static String randomvstupy(int length) {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(2));
        }
        String vstupy = sb.toString();
        return vstupy;
    }

    public static char funcoutcome(String vstupy, String poradie, ArrayList<String> bfunkcia) {
        char var, value;
        String one = "1", zero = "0", abeceda = sortstring(poradie);
        int index;

        for (int j = 0; j < poradie.length(); j++) {
            var = abeceda.charAt(j);
            value = vstupy.charAt(j);
            for (int i = 0; i < bfunkcia.size(); i++) {
                index = bfunkcia.get(i).indexOf(var);
                if (index != -1) {
                    if (value == '1') {
                        if (index - 1 == -1 || bfunkcia.get(i).charAt(index - 1) != '!') {
                            bfunkcia.set(i,
                                    bfunkcia.get(i).substring(0, index) + '1' + bfunkcia.get(i).substring(index + 1));
                        } else {
                            bfunkcia.set(i,
                                    (bfunkcia.get(i).substring(0, index) + '0' + bfunkcia.get(i).substring(index + 1)));
                            bfunkcia.set(i,
                                    (bfunkcia.get(i).substring(0, index - 1) + bfunkcia.get(i).substring(index)));
                        }
                    } else {
                        if (index - 1 != -1 && bfunkcia.get(i).charAt(index - 1) == '!') {
                            bfunkcia.set(i,
                                    (bfunkcia.get(i).substring(0, index) + '1' + bfunkcia.get(i).substring(index + 1)));
                            bfunkcia.set(i,
                                    (bfunkcia.get(i).substring(0, index - 1) + bfunkcia.get(i).substring(index)));
                        } else {
                            bfunkcia.set(i,
                                    bfunkcia.get(i).substring(0, index) + '0' + bfunkcia.get(i).substring(index + 1));
                        }
                    }
                }
            }
        }

        for (int i = 0; i < bfunkcia.size(); i++) {
            for (int j = 0; j < bfunkcia.get(i).length(); j++) {
                if (bfunkcia.get(i).charAt(j) == '0') {
                    bfunkcia.set(i, zero);
                    break;
                }
            }
            if (!bfunkcia.get(i).equals(zero)) {
                bfunkcia.set(i, one);
            }
        }

        for (int i = 0; i < bfunkcia.size(); i++) {
            if (bfunkcia.get(i).equals("1")) {
                return '1';
            }
        }

        return '0';
    }

    public static String poradiehelp(String bfunkcia) {

        Set<Character> uniqueChars = new HashSet<>();

        for (int i = 0; i < bfunkcia.length(); i++) {
            char c = bfunkcia.charAt(i);
            if (Character.isLetter(c)) {
                uniqueChars.add(c);
            }
        }

        StringBuilder sb = new StringBuilder();
        for (char c : uniqueChars) {
            sb.append(c);
        }
        String uniqueLetters = sortstring(sb.toString());

        return uniqueLetters;
    }

}
