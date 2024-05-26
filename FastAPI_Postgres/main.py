from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import JSONResponse
import psycopg2
from psycopg2 import sql
from typing import Optional
from fastapi import Query
import os

app = FastAPI()


def get_db():
    db = psycopg2.connect(
        host=os.environ.get("DATABASE_HOST"),
        port=os.environ.get("DATABASE_PORT"),
        database=os.environ.get("DATABASE_NAME"),
        user=os.environ.get("DATABASE_USER"),
        password=os.environ.get("DATABASE_PASSWORD"),
    )
    try:
        yield db
    finally:
        db.close()


@app.get("/v3/users/{user_id}/badge_history")
def users_userid_badge_history(db: psycopg2.extensions.connection = Depends(get_db),
                        user_id: Optional[int] = None,):
    cursor = db.cursor()
    cursor.execute("""  SELECT id, title, type, 
                        to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"+00"') AS created_at,
                        ROW_NUMBER() OVER (PARTITION BY type ORDER BY created_at) AS position
                        FROM (
                            SELECT *, LEAD(type) OVER (ORDER BY created_at) AS next_type, LAG(type) OVER (ORDER BY created_at) AS prev_type
                            FROM (
                                SELECT posts.id AS id, posts.title, 'post' AS type, posts.creationdate AS created_at
                                FROM posts 
                                JOIN users ON posts.owneruserid = users.id 
                                JOIN badges ON users.id = badges.userid
                                WHERE users.id = %s
                                UNION 
                                SELECT badges.id AS id, badges.name AS title, 'badge' AS type, badges.date AS created_at
                                FROM badges 
                                JOIN users ON badges.userid = users.id
                                WHERE users.id = %s
                            ) AS CombinedResults
                        ) AS WithNext_PrevType
                        WHERE (type = 'post' AND next_type = 'badge') OR (type = 'badge' AND prev_type = 'post')
                        ORDER BY created_at ASC;""", [user_id, user_id])
    result = cursor.fetchall()
    cursor.close()

    list = []

    for i in result:
        list.append({"id": i[0],
                    "title": i[1],
                    "type": i[2],
                    "created_at": i[3],
                    "position": i[4]})

    return JSONResponse(content={"items": list})


@app.get("/v3/tags/{tag}/comments/")
def tags_tag_comments_count(db: psycopg2.extensions.connection = Depends(get_db),
                        tag: Optional[str] = None,
                        count: Optional[int] = None,):
    cursor = db.cursor()
    cursor.execute("""  SELECT *, SUM(diff) OVER (PARTITION BY post_id ORDER BY created_at) / ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY created_at) AS avg
                        FROM (SELECT post_id, title, displayname, TEXT, 
                                to_char(post_created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"+00"') AS post_created_at, 
                                to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"+00"') AS created_at, 
                                created_at - COALESCE(LAG(created_at) OVER (PARTITION BY post_id ORDER BY created_at), post_created_at) AS diff
                                FROM (SELECT DISTINCT posts.id post_id, posts.title title, users.displayname displayname, comments.text TEXT, 
                                        posts.creationdate post_created_at, comments.creationdate created_at
                                        FROM posts
                                        JOIN comments ON posts.id = comments.postid
                                        LEFT JOIN users ON comments.userid = users.id
                                        JOIN post_tags ON posts.id = post_tags.post_id
                                        JOIN tags ON post_tags.tag_id = tags.id
                                        WHERE tags.tagname = %s AND posts.commentcount > %s
                                        ORDER BY comments.creationdate ASC) AS Comms
                                ORDER BY created_at ASC) AS Diff_comms
                        ORDER BY created_at ASC;""", [tag, count])
    result = cursor.fetchall()
    cursor.close()

    list = []

    for i in result:
        diff_str = str(i[6])
        diff_parts = diff_str.split(':')
        if '.' in diff_parts[-1]:
            diff_parts[-1] = diff_parts[-1].rstrip('0').rstrip('.')  
        diff_parts[0] = diff_parts[0].zfill(2)
        diff_formatted = ':'.join(diff_parts)
        
        avg_str = str(i[7])
        avg_parts = avg_str.split(':')
        if '.' in avg_parts[-1]:
            avg_parts[-1] = avg_parts[-1].rstrip('0').rstrip('.')  
        avg_parts[0] = avg_parts[0].zfill(2)
        avg_formatted = ':'.join(avg_parts)
        
        list.append({"post_id": i[0],
                    "title": i[1],
                    "displayname": i[2],
                    "text": i[3],
                    "post_created_at": i[4],
                    "created_at": i[5],
                    "diff": diff_formatted,
                    "avg": avg_formatted})

    return JSONResponse(content={"items": list})


@app.get("/v3/tags/{tagname}/comments/{position}")
def tags_tagname_comments_position_limit(db: psycopg2.extensions.connection = Depends(get_db),
                                    tagname: Optional[str] = None,
                                    position: Optional[int] = None,
                                    limit: Optional[int] = None,):
    cursor = db.cursor()
    cursor.execute("""  SELECT * 
                        FROM (
                            SELECT comments.id, users.displayname, posts.body, comments.text, comments.score, 
                            ROW_NUMBER() OVER (PARTITION BY posts.id ORDER BY comments.creationdate) AS position
                            FROM users
                            JOIN comments ON users.id = comments.userid
                            JOIN posts ON comments.postid = posts.id
                            JOIN post_tags ON posts.id = post_tags.post_id
                            JOIN tags ON post_tags.tag_id = tags.id
                            WHERE tags.tagname = %s
                            ORDER BY posts.creationdate ASC) AS CommentsNumbered
                        WHERE CommentsNumbered.position = %s
                        LIMIT %s;""", [tagname, position, limit])
    result = cursor.fetchall()
    cursor.close()

    list = []

    for i in result:
        list.append({"id": i[0],
                    "displayname": i[1],   
                    "body": i[2],
                    "text": i[3],
                    "score": i[4],
                    "position": i[5]})

    return JSONResponse(content={"items": list})


@app.get("/v3/posts/{post_id}")
def posts_postid_limit(db: psycopg2.extensions.connection = Depends(get_db),
                    post_id: Optional[int] = None,
                    limit: Optional[int] = None,):
    cursor = db.cursor()
    cursor.execute("""  SELECT users.displayname, posts.body, 
                        to_char(posts.creationdate AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"+00"') AS creationdate
                        FROM posts 
                        JOIN users ON posts.owneruserid = users.id
                        WHERE posts.id = %s OR posts.parentid = %s
                        ORDER BY creationdate ASC
                        LIMIT %s;""", [post_id, post_id, limit])
    result = cursor.fetchall()
    cursor.close()

    list = []

    for i in result:
        list.append({"displayname": i[0],
                    "body": i[1],
                    "created_at": i[2]})

    return JSONResponse(content={"items": list})


# main
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
