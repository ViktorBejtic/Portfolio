#include <stdio.h> 
#include <stdlib.h> 
#include <stdbool.h>

#include "dsalib.h"

// gcc main.c AvlTree.c SplayTree.c ChainingHashTable.c OpenAddressingHashTable.c -o DSA

int main(){
    char a;
    bool end;

    while (end == false){
        printf("\n\nWhich Data structure do you want (press l for legend): ");
        scanf("%s", &a);   
        
        switch (a){
            case 'l':
                printf("\n\na - AvlTree | s - SplayTree | c - ChainingHashTable | o - OpenAddressingHashTable");
                break;
                
            case 'a':
                Avlmain();
                break;
            
            case 's':
                Splaymain();
                break;

            case 'c':
                Chainingmain();
                break;

            case 'o':
                OpenAddressingmain();
                break;
            
            case 'e':
                end = true;
                break;

            default:
                printf("\nWrong Input\n a - AvlTree | s - SplayTree | c - ChainingHashTable | o - OpenAdessingHashTable | e - end the program");
                break;
        }
    }

    
    return 0;
}