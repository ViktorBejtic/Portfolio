#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>
#include <stdbool.h>

#define MAX_NAME 7
#define SEED 1

static bool successful;

typedef struct node {
    long long value;
    int height;
    char string[MAX_NAME];
    struct node *left, *right;
}NODE;

static NODE *newnode(int value, char string[7]);
static void insertnode(NODE **nodeptr, int value, char *string);
static void searchnode(NODE *node, int value);
static void deletenode(NODE **node, int value);
static void deletenodenode(NODE **node, int value);
static void PreOrderTravelsal(NODE *node, int level);
static void InOrderTravelsal(NODE *node);
static int updateheight(NODE *node);
static int balancefactor(NODE **node);
static void LL(NODE **node);
static void RR(NODE **node);
static void LR(NODE **node);
static void RL(NODE **node);
static int MAX(int a, int b);
static void freetree(NODE *node);
static void randstr(char *name);

int Avlmain(){
    NODE *root = NULL;
    long long count = 495, nodes = 20000, value = 0, num = 0;
    bool end = false;
    char string[MAX_NAME], a;
    srand(SEED);

    printf("\nHow big tree do you want: ");
    scanf("%lld", &num);
    for(int j = 0; j < num; j++){
        randstr(string);
        value = rand() % 150+1;
        insertnode(&root, value, string);
    }

    while(end == false){
        
        printf("\n\nWhich operation do you want (press l for legend): ");
        scanf("%s", &a);

        switch (a){
            case 'l':
                printf("\np - normal print (InOrderTravelsal) | t - visual print (PreOrderTravelsal) | i - insert 1 node | s - search 1 node | d - delete 1 node | a - test insert | f - test search | o - test delete | e - end the program");
                break;

            case 'p':
                InOrderTravelsal(root);
                break;

            case 't':
                PreOrderTravelsal(root, 0);
                break;

            case 'i':
                printf("\nNumber you want to add: ");
                scanf("%lld", &value);
                printf("\nString you want to add: ");
                scanf("%s", string);
                insertnode(&root, value, string);
                if(successful == true){
                    printf("\n%lld - %s was inserted", value, string);
                }else{
                    printf("\n%lld is already in the Tree", value);
                }
                break;

            case 's':
                printf("\nNumber you want to search: ");
                scanf("%lld", &value);
                searchnode(root, value);
                if(successful == true){
                    printf("\n%lld is in the Tree", value);
                }else{
                    printf("\n%lld is NOT in the Tree", value);
                }
                break;

            case 'd':
                printf("\nNumber you want to delete: ");
                scanf("%lld", &value);
                deletenode(&root, value);
                if(successful == true){
                    printf("\n%lld was deleted", value);
                }else{
                    printf("\n%lld is NOT in the Tree", value);
                }
                break;

            case 'a':
                srand(SEED);
                for(int j = 0; j < 100000; j++){
                    randstr(string);
                    value = rand() * rand();
                    insertnode(&root, value, string);
                }

                for(int i = 0; i < count; i++){
                    clock_t begin = clock();
                    for(int j = 0; j < nodes; j++){
                        randstr(string);
                        value = rand() * rand();
                        insertnode(&root, value, string);
                    }
                    clock_t end = clock();
                    double time_spent = (double)(end - begin) / CLOCKS_PER_SEC;
                    printf("%lf\n", time_spent);
                }
                break;

            case 'f':
                srand(SEED);
                for(int i = 0; i < count; i++){
                    for(int j = 0; j < nodes; j++){
                        randstr(string);
                        value = rand() * rand();
                        insertnode(&root, value, string);
                    }
                    clock_t begin = clock();
                    for(int j = 0; j < nodes; j++){
                        value = rand() * rand();
                        searchnode(root, value);
                    }
                    clock_t end = clock();
                    double time_spent = (double)(end - begin) / CLOCKS_PER_SEC;
                    printf("%lf\n", time_spent);
                }
                break;
            
            case 'o':
                srand(SEED);
                for(int i = 0; i < count; i++){
                    for(int j = 0; j < nodes; j++){
                        randstr(string);
                        value = rand() * rand();
                        insertnode(&root, value, string);
                    }
                    clock_t begin = clock();
                    for(int j = 0; j < nodes; j++){
                        value = rand() * rand();
                        deletenode(&root, value);
                    }
                    clock_t end = clock();
                    double time_spent = (double)(end - begin) / CLOCKS_PER_SEC;
                    printf("%lf\n", time_spent);
                }
                break;
            
            case 'e':
                freetree(&(*root));
                end = true;
                break;
            
            default:
                printf("\nWrong input\np - normal print (InOrderTravelsal) | t - visual print (PreOrderTravelsal) | i - insert 1 node | s - search 1 node | d - delete 1 node | a - test insert | f - test search | o - test delete | e - end the program");
                break;
        }
    }

    return 0;
}

static NODE *newnode(int value, char string[7]){
    NODE* new = (NODE*)malloc(sizeof(NODE));
    if(new != NULL){
        new->left = NULL;
        new->right = NULL;
        new->value = value;
        new->height = 0;
        strcpy(new->string, string);
    }
    return new;
}

static void insertnode(NODE **nodeptr, int value, char *string){
    NODE *node = *nodeptr;

    if(node == NULL){
        (*nodeptr) = newnode(value, string);
        successful = true;
        return;
    }
    if(value == node->value){
        successful = false;
        return;
    }
    if(value < node->value){
        insertnode(&(node->left), value, string);
    }else{
        insertnode(&(node->right), value, string);
    }
    balancefactor(nodeptr);
}

static void searchnode(NODE *node, int value){
    if(node == NULL){
        successful = false;
        return;
    }
    if(node->value == value){
        successful = true;
        return;
    }
    if(value < node->value){
        searchnode(node->left, value);
    }else{
        searchnode(node->right, value);
    }
}

static void deletenode(NODE **node, int value){
    NODE *delete;
    if(*node == NULL){
        successful = false;
        return;
    }
    if((*node)->value == value){
        if((*node)->left == NULL && (*node)->right == NULL){
            delete = *node;
            *node = NULL;
            successful = true;
            free(delete);
        }else if((*node)->left == NULL || (*node)->right == NULL){
            delete = *node;
            if((*node)->left == NULL){
                *node = (*node)->right;
            }else if((*node)->right == NULL){
                *node = (*node)->left;
            }
            successful = true;
            free(delete);
        }else{
            NODE *temp = (*node)->right;
            while(temp->left != NULL){
                temp = temp->left;
            }
            value = temp->value;
            deletenodenode(node, value);
            (*node)->value = value;
        }
        return;
    }else if(value < (*node)->value){
        deletenode(&(*node)->left, value);
    }else{
        deletenode(&(*node)->right, value);
    }
    balancefactor(node);
}

static void deletenodenode(NODE **node, int value){
    NODE *delete;
    if((*node)->value == value){
        if((*node)->left == NULL && (*node)->right == NULL){
            delete = *node;
            *node = NULL;
            successful = true;
            free(delete);
        }else if((*node)->left == NULL || (*node)->right == NULL){
            delete = *node;
            if((*node)->left == NULL){
                *node = (*node)->right;
            }else if((*node)->right == NULL){
                *node = (*node)->left;
            }
            successful = true;
            free(delete);
        }
        return;
    }else if(value < (*node)->value){
        deletenodenode(&(*node)->left, value);
    }else{
        deletenodenode(&(*node)->right, value);
    }
}

static void PreOrderTravelsal(NODE *node, int level){
    if(node == NULL)
        return;
    for (int i = 0; i < level; i++)
        printf(i == level - 1 ? "|-" : "  ");
    printf("%lld - %d\n", node->value, node->height);
    PreOrderTravelsal(node->left, level + 1);
    PreOrderTravelsal(node->right, level + 1);
}

static void InOrderTravelsal(NODE *node){
    if (node == NULL) {
      return;
    } 
    InOrderTravelsal(node->left);
    printf("%lld ", node->value);
    InOrderTravelsal(node->right);
}

static int updateheight(NODE *node){
    if(node->left == NULL && node->right == NULL){
        return 0;
    }else if(node->left == NULL && node->right != NULL){
        return node->right->height + 1;
    }else if(node->right == NULL && node->left != NULL){
        return node->left->height + 1;
    }else{
        return MAX(node->left->height, node->right->height) + 1;
    }
}

static int balancefactor(NODE **node){
    int bf = 0;
    if((*node)->right == NULL && (*node)->left != NULL){
        (*node)->height = (*node)->left->height + 1;
        bf = 0 - (*node)->height;
    }else if((*node)->left == NULL && (*node)->right != NULL){
        (*node)->height = (*node)->right->height +1 ;
        bf = 0 + (*node)->height;
    }else if((*node)->right != NULL && (*node)->left != NULL){
        if((*node)->left->height > (*node)->right->height){
            (*node)->height = (*node)->left->height + 1;
        }else{
            (*node)->height = (*node)->right->height + 1;
        }
        bf = (*node)->right->height - (*node)->left->height;
    }       

    if(bf > 1){
        if(balancefactor(&((*node)->right)) >= 0){
            LL(node);
        }else if(balancefactor(&((*node)->right)) == -1){
            LR(node);
        }
    }else if(bf < -1){
        if(balancefactor(&((*node)->left)) <= 0){
            RR(node);
        }else if(balancefactor(&((*node)->left)) == 1){
            RL(node);
        }
    }
    return bf;
}

static void LL(NODE **node){
    NODE *temp = *node;
    *node = (*node)->right;
    temp->right = (*node)->left;
    temp->height = updateheight(temp);
    (*node)->left = temp;
    (*node)->height = updateheight(*node);
}

static void RR(NODE **node){
    NODE *temp = *node;
    *node = temp->left;
    temp->left = (*node)->right;
    temp->height = updateheight(temp);
    (*node)->right = temp;
    (*node)->height = updateheight(*node);
}

static void LR(NODE **node){
    RR(&(*node)->right);
    LL(&(*node));
}

static void RL(NODE **node){
    LL(&(*node)->left);
    RR(&(*node));
}

static int MAX(int a, int b){
    if(a > b){
        return a;
    }else{
        return b;
    }
}

static void freetree(NODE *node){
    if (node == NULL)
        return;
 
    freetree(node->left);
    freetree(node->right);
    free(node);
    node = NULL;
}

static void randstr(char *name){
    char charset[] = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    int count = rand() % MAX_NAME;

    name[0] = '\0';

    if(count == 0 ){
        count = 5;
    }

    for (int i = 0; i < count; i++){
        int key = rand() % (int)(sizeof(charset) -1);
        name[i] = charset[key];
    }

    name[count] = '\0';
}
