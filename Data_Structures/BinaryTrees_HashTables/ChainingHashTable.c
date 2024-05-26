#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <stdbool.h>

#define MAX_NAME 15
#define SEED 1

static long long TABLE_SIZE = 3;
static long long nodesOfElements = 0;
static bool successful;

typedef struct node{
    char name[MAX_NAME];
    int ID;
    struct node *next;
}NODE;

static void empty_hash_table(NODE ***hash_table);
static void print_table(NODE ***hash_table);
static unsigned long hash(char *name);
static NODE *createnode(char name[MAX_NAME], int ID);
static void insertnode(NODE ***hash_table, NODE **node, char *name, int ID);
static void insertnewtable(NODE ***new_hash_table, NODE **node);
static void searchnode(NODE ***hash_table, NODE **node, char *name);
static void deletenode(NODE ***hash_table, NODE **node, char *name);
static void SizeUp(NODE ***hash_table);
static void SizeDown(NODE ***hash_table);
static long long Primenumber(long long table_size); 
static void randstr(char *name);

int Chainingmain(){
    NODE **hash_table = (NODE**)calloc(TABLE_SIZE, sizeof(NODE*));
    empty_hash_table(&hash_table);
    NODE *root = NULL;
    long long count = 495, nodes = 20000, num = 0;
    int ID = 0;
    bool end = false;
    char name[MAX_NAME], a;
    srand(SEED);
    
    printf("\nHow big table do you want: ");
    scanf("%lld", &num);
    for(int j = 0; j < num; j++){
        randstr(name);
        insertnode(&hash_table, &root, name, rand());
    } 

    while(end == false){
        
        printf("\n\nWhich operation do you want (press l for legend): ");
        scanf("%s", &a);

        switch (a){
        case 'l':
            printf("\np - visual print | i - insert 1 node | s - search 1 node | d - delete 1 node | a - test insert | f - test search | o - test delete | e - end the program");
            break;

        case 'p':
            print_table(&hash_table);
            break;

        case 'i':
            printf("\nName you want to add: ");
            scanf("%s", name);
            printf("\nID you want to add: ");
            scanf("%d", &ID);
            insertnode(&hash_table, &root, name, ID);
            if(successful == true){
                printf("\n%s - %d was inserted", name, ID);
            }else{
                printf("\n%s - %d is already in the Table", name, ID);
            }
            break;

        case 's':
            printf("\nName you want to search: ");
            scanf("%s", name);
            searchnode(&hash_table, &root, name);
            if(successful == true){
                printf("\n%s is in the Table", name);
            }else{
                printf("\n%s is NOT in the Table", name);
            }
            break;

        case 'd':
            printf("\nName you want to delete: ");
            scanf("%s", name);
            deletenode(&hash_table, &root, name);
            if(successful == true){
                printf("\n%s was deleted", name);
            }else{
                printf("\n%s is NOT in the Table", name);
            }
            break;

        case 'a':
            srand(SEED);
            for(int j = 0; j < 100000; j++){
                randstr(name);
                insertnode(&hash_table, &root, name, rand());
            }

            for(int i = 0; i < count; i++){
                clock_t begin = clock();
                for(int j = 0; j < nodes; j++){
                    randstr(name);
                    insertnode(&hash_table, &root, name, rand());
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
                    randstr(name);
                    insertnode(&hash_table, &root, name, rand());
                }
                clock_t begin = clock();
                for(int j = 0; j < nodes; j++){
                    randstr(name);
                    searchnode(&hash_table, &root, name);
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
                    randstr(name);
                    insertnode(&hash_table, &root, name, rand());
                }
                clock_t begin = clock();
                for(int j = 0; j < nodes; j++){
                    randstr(name);
                    deletenode(&hash_table, &root, name);
                }
                clock_t end = clock();
                double time_spent = (double)(end - begin) / CLOCKS_PER_SEC;
                printf("%lf\n", time_spent);
            }
            break;
        
        case 'e':
            free(hash_table);
            end = true;
            break;

        default:
            printf("\nWrong input\np - visual print | i - insert 1 node | s - search 1 node | d - delete 1 node | a - test insert | f - test search | o - test delete | e - end the program");
            break;
        }
    }

    return 0;
}

static void empty_hash_table(NODE ***hash_table){
    for(int i = 0; i < TABLE_SIZE; i++) {
        (*hash_table)[i] = NULL;
    }   
}

static void print_table(NODE ***hash_table){
    printf("\n");
    for (int i = 0; i < TABLE_SIZE; i++) {
        if ((*hash_table)[i] == NULL) {
            printf("\t%i\t---\n",i);
        }else{
            printf("\t%i\t", i);
            NODE *temp = (*hash_table)[i]; 
            while(temp != NULL){
                printf("%s - ", temp->name);
                temp = temp->next;
            }
            printf("\n");
        }
    }
}    

static unsigned long hash(char *name) {
    int length = strnlen(name, MAX_NAME);
    unsigned long hash_value = 0; 
    for (int i = 0; i < length; i++){
        hash_value += name[i];
        hash_value = hash_value * name[i]; 
    }
        hash_value = hash_value % TABLE_SIZE; 

    return hash_value;
}

static NODE *createnode(char name[MAX_NAME], int ID){
    NODE* new = (NODE*)malloc(sizeof(NODE));
    if(new != NULL){
        strcpy(new->name, name);
        new->ID = ID;
        new->next = NULL;
    }
    return new;
}

static void insertnode(NODE ***hash_table, NODE **node, char *name, int ID){
    long index = hash(name);
    NODE *temp = (*hash_table)[index];
    while(temp != NULL && strncmp(temp->name, name, MAX_NAME) != 0){
        temp = temp->next;
    }
    if(temp != NULL){
        successful = false;
        return;
    }
    *node = createnode(name, ID);
    if(node == NULL) return;
    (*node)->next = (*hash_table)[index];
    (*hash_table)[index] = *node;
    nodesOfElements++;
    successful = true;
    float Overload = (float) nodesOfElements / TABLE_SIZE;
    if(Overload >= 0.75){ 
        SizeUp(&(*hash_table));
    }
}

static void insertnewtable(NODE ***new_hash_table, NODE **node){
    long index = hash((*node)->name);
    (*node)->next = (*new_hash_table)[index];
    (*new_hash_table)[index] = *node;
}

static void searchnode(NODE ***hash_table, NODE **node, char *name){
    long index = hash(name);
    NODE *temp = (*hash_table)[index];
    while(temp != NULL && strncmp(temp->name, name, MAX_NAME) != 0){
        temp = temp->next;
    }
    if(temp != NULL){
        successful = true;
        return;
    }else{
        successful = false;
        return;
    }
}

static void deletenode(NODE ***hash_table, NODE **node, char *name){
    long index = hash(name);
    NODE *temp = (*hash_table)[index], *prev = NULL;
    while(temp != NULL && strncmp(temp->name, name, MAX_NAME) != 0){
        prev = temp;
        temp = temp->next;
    }
    if(temp == NULL){
        successful = false;
        return;
    }
    if(prev == NULL){
        (*hash_table)[index] = temp->next;
    }else{
        prev->next = temp->next;
    }
    nodesOfElements--;
    successful = true;
    float Underload = (float) nodesOfElements / TABLE_SIZE;
    if(Underload <= 0.25){
        SizeDown(&(*hash_table));
    }
}

static void SizeUp(NODE ***hash_table){
    long long old_table_size = TABLE_SIZE;
    long long table_size = TABLE_SIZE * 2;
    TABLE_SIZE = Primenumber(table_size);
    NODE **new_hash_table = (NODE**)calloc(TABLE_SIZE, sizeof(NODE*));
    for (int i = 0; i < old_table_size; i++) {
        if ((*hash_table)[i] != NULL) {
            NODE *temp = (*hash_table)[i], *next; 
            while(temp != NULL){
                next = temp->next;
                insertnewtable(&new_hash_table ,&temp);
                temp = next;
            }
        }    
    }
    free(*hash_table);
    *hash_table = new_hash_table;
}

static void SizeDown(NODE ***hash_table){
    long long old_table_size = TABLE_SIZE;
    long long table_size = TABLE_SIZE / 2;
    TABLE_SIZE = Primenumber(table_size);
    NODE **new_hash_table = (NODE**)calloc(TABLE_SIZE, sizeof(NODE*));
    for (int i = 0; i < old_table_size; i++) {
        if ((*hash_table)[i] != NULL) {
            NODE *temp = (*hash_table)[i], *next; 
            while(temp != NULL){
                next = temp->next;
                insertnewtable(&new_hash_table ,&temp);
                temp = next;
            }
        }    
    }
    free(*hash_table);
    *hash_table = new_hash_table;
}

static long long Primenumber(long long table_size){
    long long i = 0, m = 0;
    bool prime = true;       
    while(1){ 
        m = table_size / 2;
        prime = true;    
        for(i = 2; i <= m; i++){    
            if(table_size % i == 0){  
                prime = false;    
                break;    
            }
        }
        if(prime == true){
            return table_size; 
        }
        if(table_size > TABLE_SIZE){
            table_size++;
        }else{
            table_size--;
        }        
    }          
    return table_size;  
}    

static void randstr(char *name){
    char charset[] = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    int count = rand() % MAX_NAME;

    name[0] = '\0';

    if(count == 0 ){
        count = 10;
    }

    for (int i = 0; i < count; i++){
        int key = rand() % (int)(sizeof(charset) -1);
        name[i] = charset[key];
    }

    name[count] = '\0';
}