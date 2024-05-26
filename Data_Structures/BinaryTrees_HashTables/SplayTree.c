#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <stdbool.h>
#include <string.h>

#define MAX_NAME 7
#define SEED 1
 
static bool successful;

typedef struct node {
    long long value;
    char string[MAX_NAME];
    bool splay; 
    struct node *parent, *left, *right;
}NODE;

static NODE *newnode(int value, char string[7]);
static void insertnode(NODE **nodeptr, int value, char *string);
static void searchnode(NODE **nodeptr, int value);
static void deletenode(NODE **node, int value);
static void deletenodenode(NODE **node, int value);
static void PreOrderTravelsal(NODE *node, int level);
static void InOrderTravelsal(NODE *node);
static void rotations(NODE **node, int value);
static void zig(NODE **node);
static void zag(NODE **node);
static void zigzig(NODE **node);
static void zagzag(NODE **node);
static void zigzag(NODE **node);
static void zagzig(NODE **node);
static void randstr(char *name);

int Splaymain(){
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
            searchnode(&root, value);
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
                    searchnode(&root, value);
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
            while(root != NULL){
                deletenode(&root, root->value);
            }   
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
        new->splay = false;
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
        node->left->parent = node;
    }else{
        insertnode(&(node->right), value, string);
        node->right->parent = node;
    }
    rotations(nodeptr, value);
}

static void searchnode(NODE **nodeptr, int value){
    NODE *node = *nodeptr;
    if(node == NULL){
        successful = false;
        return;
    }
    if(node->value == value){
        successful = true;
        return;
    }
    if((value > node->value && node->right == NULL) || (value < node->value && node->left == NULL) || (node->left == NULL && node->right == NULL)){
        node->splay = true;
    }
    if(value < node->value){
        searchnode(&(node->left), value);
    }else{
        searchnode(&(node->right), value);
    }
    rotations(nodeptr, value);
}

static void deletenode(NODE **node, int value){
    NODE *delete;
    if(*node == NULL){
        successful = false;
        return;
    }
    if((value > (*node)->value && (*node)->right == NULL) || (value < (*node)->value && (*node)->left == NULL) || ((*node)->left == NULL && (*node)->right == NULL)){
        (*node)->splay = true;
    }
    if((*node)->value == value){
        if((*node)->left == NULL && (*node)->right == NULL){
            delete = *node;
            if((*node)->parent != NULL){
                (*node)->parent->splay = true;
                if((*node)->value > (*node)->parent->value){
                    (*node)->parent->right = NULL;
                }else{
                    (*node)->parent->left = NULL;
                }
            }
            *node = NULL;
            successful = true;
            free(delete);
        }else if((*node)->left == NULL || (*node)->right == NULL){
            delete = *node;
            if((*node)->parent != NULL){
                (*node)->parent->splay = true;
            }
            if((*node)->left == NULL){
                *node = (*node)->right;
            }else if((*node)->right == NULL){
                *node = (*node)->left;
            }
            (*node)->parent = delete->parent;
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
    rotations(&(*node), value);
}

static void deletenodenode(NODE **node, int value){
    NODE *delete;
    if((*node)->value == value){
        if((*node)->left == NULL && (*node)->right == NULL){
            delete = *node;
            (*node)->parent->splay = true;
            if((*node)->value > (*node)->parent->value){
                (*node)->parent->right = NULL;
            }else{
                (*node)->parent->left = NULL;
            }
            *node = NULL;
            successful = true;
            free(delete);
        }else if((*node)->left == NULL || (*node)->right == NULL){
            delete = *node;
            (*node)->parent->splay = true;
            if((*node)->left == NULL){
                *node = (*node)->right;
            }else if((*node)->right == NULL){
                *node = (*node)->left;
            }
            (*node)->parent = delete->parent;
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
    printf("%lld\n", node->value);
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

static void rotations(NODE **node, int value){
    if((*node)->parent == NULL){
        if(value > (*node)->value){
            if((*node)->right != NULL && ((*node)->right->value == value || (*node)->right->splay == true)){
                zag(&(*node));
                (*node)->splay = false;
                return;
            }            
        }else{
            if((*node)->left != NULL && ((*node)->left->value == value || (*node)->left->splay == true)){
                zig(&(*node));
                (*node)->splay = false;
                return;
            }    
        }
    }

    if((*node)->right != NULL){
        if((*node)->right->right != NULL && ((*node)->right->right->value == value || (*node)->right->right->splay == true)){
            zagzag(&(*node));
            if((*node)->parent == NULL){
                (*node)->splay = false;
            }
        }else if((*node)->right->left != NULL && ((*node)->right->left->value == value || (*node)->right->left->splay == true)){
            zagzig(&(*node));
            if((*node)->parent == NULL){
                (*node)->splay = false;
            }
        }        
    }    
    if((*node)->left != NULL){
        if((*node)->left->left != NULL && ((*node)->left->left->value == value || (*node)->left->left->splay == true)){
            zigzig(&(*node));
            if((*node)->parent == NULL){
                (*node)->splay = false;
            }
        }else if((*node)->left->right != NULL && ((*node)->left->right->value == value || (*node)->left->right->splay == true)){
            zigzag(&(*node));
            if((*node)->parent == NULL){
                (*node)->splay = false;
            }
        }    
    }
}

static void zig(NODE **node){
    NODE *temp = *node;
    *node = temp->left;
    temp->left = (*node)->right;
    if(temp->left != NULL){
        temp->left->parent = temp;
    }
    (*node)->parent = temp->parent;
    temp->parent = *node;
    (*node)->right = temp;
    if((*node)->parent != NULL){
        if((*node)->value > (*node)->parent->value){
            (*node)->parent->right = (*node);
        }else if ((*node)->value < (*node)->parent->value){
            (*node)->parent->left = (*node);
        }
    }
}

static void zag(NODE **node){
    NODE *temp = *node;
    *node = temp->right;
    temp->right = (*node)->left;
    if(temp->right != NULL){
        temp->right->parent = temp;
    }
    (*node)->parent = temp->parent;
    temp->parent = *node;
    (*node)->left = temp;
    if((*node)->parent != NULL){
        if((*node)->value > (*node)->parent->value){
            (*node)->parent->right = (*node);
        }else if ((*node)->value < (*node)->parent->value){
            (*node)->parent->left = (*node);
        }
    }
}

static void zigzig(NODE **node){
    zig(&(*node));
    zig(&(*node));
}

static void zagzag(NODE **node){
    zag(&(*node));
    zag(&(*node));
}

static void zigzag(NODE **node){
    zag(&(*node)->left);
    zig(&(*node));
}

static void zagzig(NODE **node){
    zig(&(*node)->right);
    zag(&(*node));
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
