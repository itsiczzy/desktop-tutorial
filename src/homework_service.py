from flask import Flask, request, jsonify
from flask_cors import CORS 
import duckdb, datetime

app = Flask(__name__)
db_file = 'db/my_database.db'

CORS(app)

def select_homework_list(response,id,action='profile'):
    con = duckdb.connect(database=db_file)
    today_date = datetime.datetime.now() # Get today and currect time.
    str_today = datetime.datetime.strftime(today_date,"%Y-%m-%d") # Convert datetime format to string format (YYYY-MM-DD)
    
    if action == 'profile':
        where_condition = f"asm.user_profile_id = '{id}'"
    elif action == 'assign':
        where_condition = f"asm.id = '{id}'"
        
    # Get list homework   rownumber การใส่ลำดับของชุดข้อมูล ที่มี same stage by เรียงลำดับ ข้อมุลในแต่ละะ stage จาก reminder_date asc , duedate asc , id asc
    #
    result_list = con.execute(f"""
                                SELECT * 
                                FROM (
                                    SELECT *, 
                                            ROW_NUMBER() OVER(PARTITION BY stage ORDER BY reminder_date asc , duedate asc , id asc) as rn
                                        FROM (
                                            SELECT id, 
                                                    title, 
                                                    description, 
                                                    subject_name, 
                                                    CAST(duedate AS DATE) AS duedate,
                                                    CAST(reminder_date AS DATE) AS reminder_date, 
                                                    status,
                                                    CASE WHEN CAST(reminder_date AS DATE) <= CAST('{str_today}' AS DATE) THEN
                                                                CASE WHEN CAST(duedate AS DATE) < CAST('{str_today}' AS DATE) THEN '3'
                                                                    ELSE '2' END
                                                        ELSE '1' END AS stage
                                                FROM (SELECT asm.*, sj.name as subject_name, rd.reminder_date, pg.status 
                                                        FROM assignment asm
                                                        LEFT JOIN subject sj ON asm.subject_id = sj.id
                                                        LEFT JOIN assignment_reminders rd ON asm.id = rd.assign_id
                                                        LEFT JOIN assignment_progress pg ON asm.id = pg.assign_id
                                                        WHERE {where_condition}
                                                        AND pg.status <> 'complete')
                                            ) src 
                                        ) sec_rn
                                order by stage desc , rn asc
                            """).fetchall()
    
    # Get rows homework
    if action == 'profile':
        result_rows = con.execute(f"""
                                    SELECT count(*)
                                    FROM (SELECT * FROM assignment asm
                                            LEFT JOIN assignment_progress pg ON asm.id = pg.assign_id
                                            WHERE asm.user_profile_id = '{id}'
                                            AND pg.status <> 'complete')
                                """).fetchall()
        result_rows = result_rows[0][0]
    else:
        result_rows = '1'
        
    con.close()
    
    if len(result_list) > 0:
        for i in range(len(result_list)):
            response['result'].append({
                                        'assign_id': result_list[i][0],
                                        'title': result_list[i][1],
                                        'description': result_list[i][2],
                                        'subject': result_list[i][3],
                                        'duedate': result_list[i][4],
                                        'reminder_date': result_list[i][5],
                                        'status': result_list[i][6],
                                        'stage': result_list[i][7]
                                        })
        response['message'] = 'success'
        response['total'] = result_rows
    
    return response

@app.route('/login', methods=['GET'])
def get_login():
    try:
        # Get parameters from the query string
        set_username = request.args.get('username') #username
        set_password = request.args.get('password') #password

        response_data = {
            'remark': 'GET request login received',
            'user_login' :{'username': set_username,
                            'password': set_password,
                            }
        }

        # Check param
        if set_username and set_password:
            con = duckdb.connect(database=db_file)
            result_login = con.execute(f"""
                                        SELECT b.* FROM user a LEFT JOIN user_profile b
                                            ON a.id = b.user_id
                                            WHERE  a.username = '{set_username}' 
                                            AND a.password = '{set_password}'
                                    """).fetchall()
            
            con.close()
            
            if len(result_login) > 0:
                response_data['result'] = {
                                            'id': result_login[0][0],
                                            'first_name': result_login[0][1],
                                            'last_name': result_login[0][2],
                                            'email': result_login[0][3],
                                            'student_id': result_login[0][4]
                                            }
                response_data['message'] = 'success'    
            else:
                response_data['result'] = {'error_msg': "no user profile found."
                                        } 
                response_data['message'] = 'fail'          
            
        elif set_username:     
            response_data['result'] = {
                                        'error_msg': "no input password."
                                        }
            response_data['message'] = 'fail'  
            
        elif set_password:
            response_data['result'] = {
                                        'error_msg': "no input username."
                                        }
            response_data['message'] = 'fail'  
        else:
            response_data['result'] = {
                                        'error_msg': "no parameters provided."
                                        }
            response_data['message'] = 'fail'  

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/signup_profile', methods=['GET'])
def get_signup_profile():
    try:
        #TODO Get parameters from web service url.
        set_username = request.args.get('username')
        set_password = request.args.get('password')       
        set_first_name = request.args.get('first_name')   
        set_last_name = request.args.get('last_name')
        set_email = request.args.get('email')
        set_student_id = request.args.get('student_id')

        #TODO create response_data parameter with json format.
        response_data = {
            'remark': 'GET request signup_profile received'
        }
        
        #TODO Check value all parameters.
        if set_username and set_password and set_first_name and set_last_name and set_email and set_student_id:
            
            #TODO Open DB Connection.
            con = duckdb.connect(database=db_file)
            
            # Select count username from 'user' table     นับ ถ้าไม่เจอก็แทรก
            get_user_rows = con.execute(f"""
                                SELECT count(*) FROM user
                                WHERE username = '{set_username}'
                            """).fetchall()
            
            if get_user_rows[0][0] == 0: # There isn't data from the 'user' table (username is not duplicate)
                # Insert table user
                con.execute(f"""
                            INSERT INTO user(username,password)
                                    VALUES ('{set_username}','{set_password}')
                            """)
                
                # Select id  from tabl user
                get_user_id = con.execute(f"""
                                    SELECT id FROM user
                                    WHERE username = '{set_username}' 
                                    AND password = '{set_password}'
                                """).fetchall()
                set_user_id = get_user_id[0][0]
                
                # Insert table user_profile
                con.execute(f"""
                            INSERT INTO user_profile(first_name,last_name,email,student_id,user_id) VALUES
                                        ('{set_first_name}','{set_last_name}','{set_email}','{set_student_id}','{set_user_id}')
                            """)

                # Select User description
                result_list = con.execute(f"""SELECT username , password , first_name, last_name, email, student_id
                                        FROM (
                                                SELECT * FROM user usr
                                                LEFT JOIN user_profile pf ON usr.id = pf.user_id
                                                WHERE usr.username = '{set_username}' 
                                                AND usr.password = '{set_password}'
                                        ) usr_pf
                                """).fetchall()

                #TODO Close DB Connection.
                con.close()

                if len(result_list) > 0: # Check result : If there is data from the 'user' and 'user_profile' table. 
                    i =0 # Default index 0 because register 1 username have 1 user profile only.
                    response_data['result'] = {
                                                    'username': result_list[i][0],
                                                    'password': result_list[i][1],
                                                    'first_name': result_list[i][2],
                                                    'last_name': result_list[i][3],
                                                    'email': result_list[i][4],
                                                    'student_id': result_list[i][5]
                                                    }
                    response_data['message'] = 'success'
                
                else: # No result from 'user' and 'user_profile' table (Signup not complete)
                    response_data['result'] = {
                                            'message': "fail",
                                            'error_msg': "signup incurrect."
                                            }    
            else:# There is data 'username' from the 'user' table 
                response_data['result'] = {
                                        'message': "fail",
                                        'error_msg': "username is duplicate."
                                        }    
        else: # No send value from web service.
            response_data['result'] = {
                                        'error_msg': "no parameters provided."
                                        }
            response_data['message'] = 'fail'  
            
        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/subject_list', methods=['GET'])
def get_subject_list():
    try:
        response_data = {
                'remark': 'GET request subject_list received',
                'result': []
            }      

        con = duckdb.connect(database=db_file)
        result_subject = con.execute(f"SELECT * FROM subject order by id").fetchall()

        con.close()
        
        if len(result_subject) > 0:
            for i in range(len(result_subject)):
                response_data['result'].append({
                                            'id': result_subject[i][0],
                                            'name': result_subject[i][1]
                                            })
                
            response_data['message'] = 'success'
            response_data['total'] = len(result_subject)                

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/homework_list', methods=['GET'])
def get_homework_list():
    try:
        # Get parameters from the query string
        set_user_profile_id = request.args.get('user_id')

        response_data = {
                'remark': 'GET request homework_list received',
                'user_profile' :{'id': set_user_profile_id},
                'result': []
            }

        # Check param
        if set_user_profile_id:
            response_data = select_homework_list(response=response_data,id=set_user_profile_id)
                
        else:
            response_data['result'] = {
                                        'message': "no parameters provided."
                                        }        
                
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/homework_detail', methods=['GET'])
def get_homework_detail():
    try:
        # Get parameters from the query string
        set_assign_id = request.args.get('assign_id')
        response_data = {
                'remark': 'GET request homework_detail received',
                'assign_id' :{'id': set_assign_id},
                'result': []
            }      

        if set_assign_id:
            ### Select Homework list ###
            response_data = select_homework_list(response=response_data,id=set_assign_id,action='assign')
                
        else:
            response_data['result'] = {
                                    'message': "fail",
                                    'error_msg': "no user profile found."
                                    }                     

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/add_homework', methods=['GET'])
def get_add_homework():
    try:
        # Get parameters from the query string
        set_user_profile_id = request.args.get('user_id')
        set_subject_id = request.args.get('subject_id')
        set_title = request.args.get('title')
        set_description = request.args.get('description')
        set_duedate = request.args.get('duedate')
        set_reminder_date = request.args.get('reminder_date')
        
        response_data = {
                'remark': 'GET request add_homework received',
                'user_profile' :{'id': set_user_profile_id},
                'result': []
            }        
        
        con = duckdb.connect(database=db_file)
        
        if set_user_profile_id and set_subject_id and set_title and set_description and set_duedate and set_reminder_date:
            ### Insert Data ###
            # Insert data to table assignment.
            con.execute(f"""
                            INSERT INTO assignment(title,description,duedate,user_profile_id,subject_id) VALUES
                                    ('{set_title}','{set_description}','{set_duedate}','{set_user_profile_id}','{set_subject_id}')
                        """)
            
            # Select id new transaction from table assignment.
            get_id = con.execute(f"""
                                    SELECT id FROM assignment WHERE title = '{set_title}' AND description = '{set_description}'
                                                        AND user_profile_id = '{set_user_profile_id}' AND subject_id = '{set_subject_id}'
                                    """).fetchall()
            set_assign_id = get_id[0][0]
            
            if len(get_id) == 1:
                # Insert data to table assignment_reminders.
                con.execute(f"""
                                INSERT INTO assignment_reminders(reminder_date,assign_id) VALUES
                                                            ('{set_reminder_date}','{set_assign_id}')
                                """)

                # Insert data to table assignment_progress.
                con.execute(f"""
                                INSERT INTO assignment_progress(status,completion_date,assign_id) VALUES
                                                            ('panding',NULL,'{set_assign_id}')
                                """)

            ### Select Homework list ###
            response_data = select_homework_list(response=response_data,id=set_user_profile_id)
                
        else:
            response_data['result'] = {
                                        'message': "no parameters provided."
                                        }        
            
        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_homework_status', methods=['GET'])
def get_update_homework_status():
    try:
        set_user_profile_id = request.args.get('user_id')
        set_status_assign = request.args.get('status_assign')
        set_assign_id = request.args.get('assign_id')
        
        response_data = {
                'remark': 'GET request update_homework_status received',
                'assign_id' :{'id': set_assign_id},
                'result': []
            }            
        
        if set_user_profile_id and set_assign_id and set_status_assign:
            con = duckdb.connect(database=db_file)
            today_date = datetime.datetime.now()
            str_today = datetime.datetime.strftime(today_date,"%Y-%m-%d %H:%M:%S")
        
            ### Update Data ###
            # Update data to table assignment_progress.
            if set_status_assign == 'complete':
                print(set_status_assign)
                con.execute(f"""
                                UPDATE assignment_progress 
                                SET status = '{set_status_assign}', completion_date = '{str_today}'    
                                WHERE assign_id = '{set_assign_id}'
                            """)   
            else:
                con.execute(f"""
                                UPDATE assignment_progress 
                                SET status = '{set_status_assign}'
                                WHERE assign_id = '{set_assign_id}'
                            """)         
        
            ### Select Homework list ###
            response_data = select_homework_list(response=response_data,id=set_user_profile_id)
        
        else:
            response_data['result'] = {
                                        'message': "no parameters provided."
                                        }        
            
        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500    
    
@app.route('/update_homework_detail', methods=['GET'])
def get_update_homework_detail():
    try:
        # Get parameters from the query string
        set_assign_id = request.args.get('assign_id')
        set_user_profile_id = request.args.get('user_id')
        set_subject_id = request.args.get('subject_id')
        set_title = request.args.get('title')
        set_description = request.args.get('description')
        set_duedate = request.args.get('duedate')
        set_reminder_date = request.args.get('reminder_date')
                
        response_data = {
                'remark': 'GET request update_homework_detail received',
                'assign_id' :{'id': set_assign_id},
                'result': []
            }        
        
        con = duckdb.connect(database=db_file)
        
        if set_user_profile_id and set_subject_id and set_title and set_description and set_duedate and set_reminder_date:
            ### Update Data ### 
            # Update data to table assignment.
            
            con.execute(f"""
                            UPDATE assignment SET title = '{set_title}',
                                                description = '{set_description}',
                                                duedate = '{set_duedate}',
                                                subject_id = '{set_subject_id}'
                                WHERE id = '{set_assign_id}'
                        """)
            
            # Update data to table assignment_reminders.
            con.execute(f"""
                                UPDATE assignment_reminders SET reminder_date = '{set_reminder_date}'
                                WHERE assign_id = '{set_assign_id}'
                            """)
                        
            ### Select Homework list ###  
            response_data = select_homework_list(response=response_data,id=set_user_profile_id)
            
                           
        else:
            response_data['result'] = {
                                        'message': "no parameters provided."
                                        }        
            
        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/delete_homework', methods=['GET'])
def get_delete_homework():
    try:
        # Get parameters from the query string
        set_assign_id = request.args.get('assign_id')
        set_user_profile_id = request.args.get('user_id')
                
        response_data = {
                'remark': 'GET request update_homework received',
                'user_profile' :{'id': set_user_profile_id},
                'result': []
            }        
        
        con = duckdb.connect(database=db_file)
        today_date = datetime.datetime.now()
        str_today = datetime.datetime.strftime(today_date,"%Y-%m-%d %H:%M:%S")
        
        if set_user_profile_id and set_assign_id:
            ### Delete Data ### 
            # Delete data to table assignment.
            con.execute(f"DELETE FROM assignment_progress WHERE assign_id = '{set_assign_id}'")
            
            # Delete data to table assignment.
            con.execute(f"DELETE FROM assignment_reminders WHERE assign_id = '{set_assign_id}'")
            
            # Delete data to table assignment.
            con.execute(f"DELETE FROM assignment WHERE id = '{set_assign_id}'")

            ### Select Homework list ###
            response_data = select_homework_list(response=response_data,id=set_user_profile_id)
                
        else:
            response_data['result'] = {
                                        'message': "no parameters provided."
                                        }        
                
        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080) #Make accessible on local network.

# http://localhost:8080/login?username=abc_99&password=P@ssw0rd
# http://localhost:8080/homework_list?user_id=2
# http://localhost:8080/add_homework?user_id=2&subject_id=1&title=Data Training&description=Training Training Training&duedate=2025-03-10&reminder_date=2025-03-6
# http://localhost:8080/subject_list
# http://localhost:8080/homework_detail?assign_id=2
# http://localhost:8080/update_homework_detail?user_id=2&assign_id=3&subject_id=1&title=Data Training&description=Training Training Training&duedate=2025-03-10&reminder_date=2025-03-6
# http://localhost:8080/delete_homework?user_id=2&assign_id=2
# http://localhost:8080/signup_profile?username=abc_01&password=P@ssw0rd&first_name=ukrit&last_name=jaiaue&email=ukritice@gmail.com&student_id=ABC490680
# http://localhost:8080/update_homework_status?assign_id=2&status_assign=inprogress

@app.route('/add_stat_subject', methods=['POST'])
def add_stat_subject():
    try:
        # ตั้งค่าค่าของ subject_name เป็น "stat"
        new_subject_name = "stat"  # กำหนดชื่อวิชาเป็น "stat"

        response_data = {'remark': 'Adding or updating subject', 'result': []}

        if new_subject_name:
            con = duckdb.connect(database=db_file)
            
            # เช็ค
            existing_subject = con.execute("""
                SELECT subject_id FROM subject WHERE subject_name = ?
            """, (new_subject_name,)).fetchone()

            if existing_subject:
                # ถ้ามีให้ทำการอัปเดต
                con.execute("""
                    UPDATE subject
                    SET subject_name = ?
                    WHERE subject_id = ?
                """, (new_subject_name, existing_subject[0]))
                response_data['result'] = {'message': 'Subject updated successfully'}
            else:
                # ถ้าไม่มีให้ทำการเพิ่ม
                con.execute("""
                    INSERT INTO subject (subject_name)
                    VALUES (?)
                """, (new_subject_name,))  # เพิ่มเครื่องหมายจุลภาคเพื่อให้เป็น tuple
                response_data['result'] = {'message': 'Subject added successfully'}

        else:
            response_data['result'] = {'message': 'Missing parameters'}

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    # con.close()
