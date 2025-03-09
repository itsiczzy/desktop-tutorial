
import duckdb
db_file = 'src/db/my_database.db' 
con = duckdb.connect(database=db_file)

def create_table(table):
    if table == 'user':
        # Create a sequence
        con.execute("DROP SEQUENCE IF EXISTS user_id_seq")
        con.execute("CREATE SEQUENCE user_id_seq;")

        con.execute("CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY DEFAULT nextval('user_id_seq'), \
                                                    username TEXT(20), password TEXT(20))")
        con.execute("INSERT INTO user(username,password) \
                            VALUES ('aka_001','asdfgh'), ('abc_99','P@ssw0rd')")

        result = con.execute("SELECT * FROM user").fetchall()
        print(result)
                
    elif table == 'user_profile':
        # Create a sequence
        con.execute("DROP SEQUENCE IF EXISTS user_profile_id_seq")
        con.execute("CREATE SEQUENCE user_profile_id_seq;")
        
        con.execute("CREATE TABLE IF NOT EXISTS user_profile (id INTEGER PRIMARY KEY DEFAULT nextval('user_profile_id_seq'), \
                                                first_name TEXT(200), \
                                                last_name TEXT(200), \
                                                email TEXT(100), \
                                                student_id TEXT(50), \
                                                user_id INTEGER, \
                                                FOREIGN KEY (user_id) REFERENCES user(id))")
        
        con.execute("INSERT INTO user_profile(first_name,last_name,email,student_id,user_id) VALUES \
                                ('ice','tipsak','ice_001@gmail.com','ABC001','1'), \
                                ('pang','kaka','pang_naja@gmail.com','ABC002','2')")

        result = con.execute("SELECT * FROM user_profile").fetchall()
        print(result)
        
    elif table == 'subject':
        # Create a sequence
        con.execute("DROP SEQUENCE IF EXISTS subject_id_seq")
        con.execute("CREATE SEQUENCE subject_id_seq;")
        
        con.execute("CREATE TABLE IF NOT EXISTS subject (id INTEGER PRIMARY KEY DEFAULT nextval('subject_id_seq'), \
                                                        name TEXT(100))")
        
        con.execute("INSERT INTO subject(name) VALUES ('bio'), ('math'), ('science')")

        result = con.execute("SELECT * FROM subject").fetchall()
        print(result)
        
    elif table == 'assignment':
        # Create a sequence
        con.execute("DROP SEQUENCE IF EXISTS assignment_id_seq")
        con.execute("CREATE SEQUENCE assignment_id_seq;")

        con.execute("CREATE TABLE IF NOT EXISTS assignment (id INTEGER PRIMARY KEY DEFAULT nextval('assignment_id_seq'), \
                                title TEXT(200), \
                                description TEXT(200), \
                                duedate DATETIME, \
                                user_profile_id INTEGER, \
                                subject_id INTEGER, \
                                FOREIGN KEY (user_profile_id) REFERENCES user_profile(id))")
        
        con.execute("INSERT INTO assignment(title,description,duedate,user_profile_id,subject_id) VALUES \
                                ('anatomy lap','adasdasd','2025-02-28','1','1'), \
                                ('counting homework','sadfasdfaf','2025-02-20','2','2'), \
                                ('DNA lap','sadfasdfaf','2025-02-10','2','3')")

        result = con.execute("SELECT * FROM assignment").fetchall()
        print(result)
        
    elif table == 'assignment_reminders':
        # Create a sequence
        con.execute("DROP SEQUENCE IF EXISTS assignment_reminders_id_seq")
        con.execute("CREATE SEQUENCE assignment_reminders_id_seq;")

        con.execute("CREATE TABLE IF NOT EXISTS assignment_reminders (id INTEGER PRIMARY KEY DEFAULT nextval('assignment_reminders_id_seq'), \
                                                reminder_date DATETIME, \
                                                assign_id INTEGER, \
                                                FOREIGN KEY (assign_id) REFERENCES assignment(id))")
        
        con.execute("INSERT INTO assignment_reminders(reminder_date,assign_id) VALUES \
                                                    ('2025-02-26','1'), \
                                                    ('2025-02-15','2'), \
                                                    ('2025-02-09','3')")

        result = con.execute("SELECT * FROM assignment_reminders").fetchall()
        print(result)
        
    elif table == 'assignment_progress':
        # Create a sequence
        con.execute("DROP SEQUENCE IF EXISTS assignment_progress_id_seq")
        con.execute("CREATE SEQUENCE assignment_progress_id_seq;")

        con.execute("CREATE TABLE IF NOT EXISTS assignment_progress (id INTEGER PRIMARY KEY DEFAULT nextval('assignment_progress_id_seq'), \
                                                status TEXT(50), \
                                                completion_date DATETIME, \
                                                assign_id INTEGER, \
                                                FOREIGN KEY (assign_id) REFERENCES assignment(id))")
        
        con.execute("INSERT INTO assignment_progress(status,completion_date,assign_id) VALUES \
                                                    ('complete','2025-02-10 10:20:54','1'), \
                                                    ('panding', NULL,'2'), \
                                                    ('inprogress', NULL,'3')")

        result = con.execute("SELECT * FROM assignment_progress").fetchall()
        print(result)

def list_tables_in_duckdb(db_path):
    try:
        # con = duckdb.connect(database=db_path, read_only=True) # Open in read-only mode to prevent accidental changes.
        tables = con.execute("SHOW TABLES").fetchall()
        if tables:
            print(f"Tables in '{db_path}':")
            for table in tables:
                print(table[0])  # Print the table name
        else:
            print(f"No tables found in '{db_path}'.")
        con.close()

    except duckdb.Error as e:
        print(f"An error occurred: {e}")
    except FileNotFoundError:
        print(f"File not found: {db_path}")

# list_tables_in_duckdb(db_file)
# result = con.execute("""
#                      SELECT * 
#                      FROM assignment_progress
#                      where assign_id = '2'
#                      """).fetchall()
# # result = con.execute("""
# #                      SELECT * 
# #                      FROM user_profile
# #                      """).fetchall()
# print(result)
# print(result[0][1])
# print(result[0][2])
# print(result[0][3])
# print(result[0][4])

### Create Table with param name: ###
con.execute("DROP TABLE IF EXISTS assignment_reminders;")
con.execute("DROP TABLE IF EXISTS assignment_progress;")
con.execute("DROP TABLE IF EXISTS assignment;")
con.execute("DROP TABLE IF EXISTS user_profile;")
con.execute("DROP TABLE IF EXISTS user;")
con.execute("DROP TABLE IF EXISTS subject;")

create_table("user")
create_table("user_profile")
create_table("subject")
create_table("assignment")
create_table("assignment_reminders")
create_table("assignment_progress")



import datetime

today_date = datetime.datetime.now()
str_today = datetime.datetime.strftime(today_date,"%Y-%m-%d")
# print(str_today)
# str_today = '2025-02-16'

# result_list = con.execute(f"SELECT  id,title, description, CAST(duedate AS DATE) AS duedate, CAST(reminder_date AS DATE) AS reminder_date, status \
#                         , CASE WHEN CAST(reminder_date AS DATE) < CAST('{str_today}' AS DATE) THEN \
#                                 CASE WHEN CAST(duedate AS DATE) < CAST('{str_today}' AS DATE) THEN '3' ELSE '2' END \
#                             ELSE '1' END AS stage \
#                         FROM (SELECT asm.*, rd.reminder_date, pg.status, pg.completion_date \
#                                 FROM assignment asm \
#                                 LEFT JOIN assignment_reminders rd ON asm.id = rd.assign_id \
#                                 LEFT JOIN assignment_progress pg ON asm.id = pg.assign_id and status <> 'complete' \
#                                 WHERE asm.user_profile_id = '2')  \
#                         GROUP BY id,title, description, duedate, reminder_date, status \
#                         ORDER BY stage desc, reminder_date asc , id asc \
#                     ").fetchall()
# user_p_id = '2'
# result_list = con.execute(f"""
#                           SELECT * FROM (
#                                 SELECT *, ROW_NUMBER() OVER(PARTITION BY stage ORDER BY stage desc, reminder_date asc , id asc) as rm
#                                     FROM (
#                                         SELECT id, title, description, CAST(duedate AS DATE) AS duedate,
#                                                     CAST(reminder_date AS DATE) AS reminder_date, status
#                                                     , CASE WHEN CAST(reminder_date AS DATE) < CAST('{str_today}' AS DATE) THEN
#                                                                 CASE WHEN CAST(duedate AS DATE) < CAST('{str_today}' AS DATE) THEN '3'
#                                                                     ELSE '2' END
#                                                         ELSE '1' END AS stage
#                                             FROM (SELECT asm.*, rd.reminder_date, pg.status FROM assignment asm
#                                                     LEFT JOIN assignment_reminders rd ON asm.id = rd.assign_id
#                                                     LEFT JOIN assignment_progress pg ON asm.id = pg.assign_id AND pg.status <> 'complete'
#                                                     WHERE asm.user_profile_id = '{user_p_id}' )
#                                         ) src 
#                                     ) sec_rm
#                             order by stage desc , rm asc
#                         """).fetchall()

# result_rows = con.execute(f"""
#                             SELECT count(*)
#                             FROM (SELECT asm.*, rd.reminder_date, pg.status FROM assignment asm
#                                     LEFT JOIN assignment_reminders rd ON asm.id = rd.assign_id
#                                     LEFT JOIN assignment_progress pg ON asm.id = pg.assign_id AND pg.status <> 'complete'
#                                     WHERE asm.user_profile_id = '{user_p_id}' )
#                         """).fetchall()
    
# print(len(result_rows)) 
# print(result_rows[0][0])

# # result = con.execute(f"SELECT asm.*, rd.reminder_date, pg.status, pg.completion_date \
# #                                 FROM assignment asm \
# #                                 LEFT JOIN assignment_reminders rd ON asm.id = rd.assign_id \
# #                                 LEFT JOIN assignment_progress pg ON asm.id = pg.assign_id \
# #                                 WHERE asm.user_profile_id = '2' AND pg.status <> 'complete'").fetchall()

# result = con.execute("SELECT * FROM assignment_reminders order by id").fetchall()
# result = con.execute("SELECT * FROM assignment_progress order by id").fetchall()

# result = con.execute("DELETE FROM assignment_reminders where assign_id = '6'")
# result = con.execute("DELETE FROM assignment_progress where assign_id = '6'")
# result = con.execute("DELETE FROM assignment where id = '6'")
# result = con.execute("SELECT * FROM assignment where user_profile_id='2' order by id").fetchall()
# result = con.execute("SELECT * FROM assignment_progress order by id").fetchall()
# result = con.execute("SELECT * FROM assignment_reminders order by id").fetchall()
# print(len(result))
# print(result)
# print(result[0][1])
# print(result[0][2])
# print(result[0][3])
# print(result[0][4])

# print(result[1][1])
# print(result[1][2])
# print(result[1][3])
# print(result[1][4])


# get_id = con.execute(f"SELECT id FROM assignment WHERE title = 'anatomy lap' AND description = 'adasdasd' \
#                                                     AND user_profile_id = '1' AND subject_id = '1'").fetchall()
        
# set_assign_id = get_id[0][0]
# print(set_assign_id)

### List All Table in DB file ###
# list_tables_in_duckdb(db_file)

# result = con.execute("SELECT a.*, b.reminder_date FROM assignment a \
#                      JOIN assignment_reminders b ON a.id = b.assign_id").fetchall()
# print(result)

