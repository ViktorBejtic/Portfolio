import java.util.Scanner;
import java.util.ArrayList;

public class mainbdd {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        BDD bdd = new BDD();
        String bfunkcia = new String();
        String poradie = new String();
        String vstupy = new String();
        char output, a = '1';
        int n;
        boolean koniec = false;

        while (!koniec) {
            System.out.println("\nc - create own BDD"
                    + "\nt - test BDD_create_with_best_order"
                    + "\nh - test BDD_create"
                    + "\ng - generate random DNF"
                    + "\ne - end");
            System.out.print("Enter character: ");
            a = sc.next().charAt(0);
            switch (a) {
                case 't':
                    System.out.print("\nEnter how many variables do you want: ");
                    n = sc.nextInt();
                    App.testROBDD(n);
                    koniec = true;
                    break;
                case 'h':
                    System.out.print("\nEnter how many variables do you want: ");
                    n = sc.nextInt();
                    App.testBDD(n);
                    koniec = true;
                    break;
                case 'e':
                    koniec = true;
                    break;
                case 'g':
                    System.out.print("\nEnter how many variables do you want: ");
                    n = sc.nextInt();
                    System.out.println("\n" + App.DNFgenerator(n));
                    break;
                case 'c':
                    System.out.print("\nEnter boolean function: ");
                    bfunkcia = sc.next();
                    System.out
                            .println("\nc - BDD_create" + "\nb - BDD_with_best_order");
                    System.out.print("Enter character: ");
                    a = sc.next().charAt(0);
                    switch (a) {
                        case 'b':
                            bdd = App.BDD_create_with_best_order(bfunkcia);
                            break;
                        case 'c':
                            System.out.println("\nr - random variable order" + "\no - own variable order");
                            System.out.print("Enter character: ");
                            a = sc.next().charAt(0);
                            switch (a) {
                                case 'r':
                                    ArrayList<String> poradia = new ArrayList<>();
                                    char[] uniqueCharsArray = App.poradiehelp(bfunkcia).toCharArray();
                                    poradie = App.randomporadie(uniqueCharsArray, poradia);
                                    System.out.println("\nRandom variable order: " + poradie);
                                    bdd = App.BDD_create(bfunkcia, poradie);
                                    break;
                                case 'o':
                                    System.out.println(
                                            "\n Available variables \"" + App.poradiehelp(bfunkcia) + "\"");
                                    System.out.print("Enter variable order: ");
                                    poradie = sc.next();
                                    bdd = App.BDD_create(bfunkcia, poradie);
                                    break;
                            }
                            break;
                    }
                    while (!koniec) {
                        System.out.println("\nt - test if BDD is correctly build"
                                + "\nu - BDD_use"
                                + "\nr - random input BDD_use"
                                + "\nc - check BDD's nodecount, varcount and reduction"
                                + "\ne - end");
                        System.out.print("Enter character: ");
                        a = sc.next().charAt(0);
                        switch (a) {
                            case 't':
                                if (App.correctBDD(bdd, bdd.getFunclist())) {
                                    System.out.println("\nBDD is correct");
                                } else {
                                    System.out.println("\nBDD is INcorrect");
                                }
                                break;
                            case 'u':
                                System.out.println(
                                        "\n  Variables  \"" + App.poradiehelp(bfunkcia) + "\"");
                                System.out.print("Enter inputs: ");
                                vstupy = sc.next();
                                output = App.BDD_use(bdd, vstupy);
                                System.out.println("Output is: " + output);
                                break;
                            case 'r':
                                vstupy = App.randomvstupy(bdd.getVarcount());
                                System.out.println("\nRandom input: " + vstupy);
                                output = App.BDD_use(bdd, vstupy);
                                System.out.println("Output is: " + output);
                                break;
                            case 'c':
                                System.out.println("\nNodecount: " + bdd.getNodecount()
                                        + "\nVarcount: " + bdd.getVarcount() +
                                        "\nReduction: " + bdd.getReduction() + "%");
                                if (bdd.getROBDDReduction() != 0) {
                                    System.out.println("ROBDD reduction: " + bdd.getROBDDReduction() + "%");
                                }
                                System.out.println("Variable order: " + bdd.getPoradie());
                                break;
                            case 'e':
                                koniec = true;
                                break;
                        }
                    }
                    koniec = false;
                    break;
            }
        }
        sc.close();
    }
}
