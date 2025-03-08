from flask import Flask, request, jsonify
from flask_cors import CORS 
import duckdb, datetime

app = Flask(__name__)

CORS(app)

def select_homework_list():
    pass

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
            db_file = 'db/my_database.db' 
            con = duckdb.connect(database=db_file)
            result_login = con.execute(f"SELECT b.* FROM user a LEFT JOIN user_profile b \
                                    ON a.id = b.user_id \
                                    WHERE  a.username = '{set_username}' AND a.password = '{set_password}'").fetchall()
            
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
            db_file = 'db/my_database.db' 
            con = duckdb.connect(database=db_file)
            today_date = datetime.datetime.now()
            str_today = datetime.datetime.strftime(today_date,"%Y-%m-%d")
            #str_today = '2025-02-16'
    
            result_list = con.execute(f"SELECT id, title, description, CAST(duedate AS DATE) AS duedate, \
                                                CAST(reminder_date AS DATE) AS reminder_date, status \
                                                , CASE WHEN CAST(reminder_date AS DATE) < CAST('{str_today}' AS DATE) THEN \
                                                            CASE WHEN CAST(duedate AS DATE) < CAST('{str_today}' AS DATE) THEN '3' \
                                                                ELSE '2' END \
                                                    ELSE '1' END AS stage \
                                        FROM (SELECT asm.*, rd.reminder_date, pg.status, pg.completion_date FROM assignment asm \
                                                LEFT JOIN assignment_reminders rd ON asm.id = rd.assign_id \
                                                LEFT JOIN assignment_progress pg ON asm.id = pg.assign_id AND pg.status <> 'complete'\
                                                WHERE asm.user_profile_id = '{set_user_profile_id}')  \
                                        ORDER BY stage desc \
                                    ").fetchall()

            con.close()
            
            if len(result_list) > 0:
                for i in range(len(result_list)):
                    response_data['result'].append({
                                                'id': result_list[i][0],
                                                'title': result_list[i][1],
                                                'description': result_list[i][2],
                                                'duedate': result_list[i][3],
                                                'reminder_date': result_list[i][4],
                                                'status': result_list[i][5],
                                                'stage': result_list[i][6]
                                                })

                response_data['message'] = 'success'
                response_data['total'] = len(result_list)
                
        else:
            response_data['result'] = {
                                        'message': "no parameters provided."
                                        }        
                
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

        db_file = 'db/my_database.db' 
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
            db_file = 'db/my_database.db' 
            con = duckdb.connect(database=db_file)
            today_date = datetime.datetime.now()
            str_today = datetime.datetime.strftime(today_date,"%Y-%m-%d")
            result_list = con.execute(f"SELECT id, title, description, CAST(duedate AS DATE) AS duedate, \
                                                CAST(reminder_date AS DATE) AS reminder_date, status \
                                                , CASE WHEN CAST(reminder_date AS DATE) < CAST('{str_today}' AS DATE) THEN \
                                                            CASE WHEN CAST(duedate AS DATE) < CAST('{str_today}' AS DATE) THEN '3' \
                                                                ELSE '2' END \
                                                    ELSE '1' END AS stage \
                                        FROM (SELECT asm.*, rd.reminder_date, pg.status, pg.completion_date FROM assignment asm \
                                                LEFT JOIN assignment_reminders rd ON asm.id = rd.assign_id \
                                                LEFT JOIN assignment_progress pg ON asm.id = pg.assign_id AND pg.status <> 'complete' \
                                                WHERE asm.id = '{set_assign_id}' )  \
                                        GROUP BY id,title, description, duedate, reminder_date, status \
                                        ORDER BY stage desc, reminder_date asc , id asc \
                                    ").fetchall()

            con.close()
            
            if len(result_list) > 0:
                for i in range(len(result_list)):
                    response_data['result'].append({
                                                'id': result_list[i][0],
                                                'title': result_list[i][1],
                                                'description': result_list[i][2],
                                                'duedate': result_list[i][3],
                                                'reminder_date': result_list[i][4],
                                                'status': result_list[i][5],
                                                'stage': result_list[i][6]
                                                })
                response_data['message'] = 'success'
                response_data['total'] = len(result_list)
                
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
        
        db_file = 'db/my_database.db' 
        con = duckdb.connect(database=db_file)
        
        if set_user_profile_id and set_subject_id and set_title and set_description and set_duedate and set_reminder_date:
            ### Insert Data ###
            # Insert data to table assignment.
            con.execute(f"INSERT INTO assignment(title,description,duedate,user_profile_id,subject_id) VALUES \
                                    ('{set_title}','{set_description}','{set_duedate}','{set_user_profile_id}','{set_subject_id}')")
            
            # Select id new transaction from table assignment.
            get_id = con.execute(f"SELECT id FROM assignment WHERE title = '{set_title}' AND description = '{set_description}' \
                                                        AND user_profile_id = '{set_user_profile_id}' AND subject_id = '{set_subject_id}'").fetchall()
            set_assign_id = get_id[0][0]
            
            if len(get_id) == 1:
                # Insert data to table assignment_reminders.
                con.execute(f"INSERT INTO assignment_reminders(reminder_date,assign_id) VALUES \
                                                            ('{set_reminder_date}','{set_assign_id}')")

                # Insert data to table assignment_progress.
                con.execute(f"INSERT INTO assignment_progress(status,completion_date,assign_id) VALUES \
                                                            ('panding',NULL,'{set_assign_id}')")

            ### Select Homework list ###
            today_date = datetime.datetime.now()
            str_today = datetime.datetime.strftime(today_date,"%Y-%m-%d")
            #str_today = '2025-02-16'
    
            result_list = con.execute(f"SELECT id, title, description, CAST(duedate AS DATE) AS duedate, \
                                                CAST(reminder_date AS DATE) AS reminder_date, status \
                                                , CASE WHEN CAST(reminder_date AS DATE) < CAST('{str_today}' AS DATE) THEN \
                                                            CASE WHEN CAST(duedate AS DATE) < CAST('{str_today}' AS DATE) THEN '3' \
                                                                ELSE '2' END \
                                                    ELSE '1' END AS stage \
                                        FROM (SELECT asm.*, rd.reminder_date, pg.status, pg.completion_date FROM assignment asm \
                                                LEFT JOIN assignment_reminders rd ON asm.id = rd.assign_id \
                                                LEFT JOIN assignment_progress pg ON asm.id = pg.assign_id AND pg.status <> 'complete' \
                                                WHERE asm.user_profile_id = '{set_user_profile_id}' )  \
                                        GROUP BY id,title, description, duedate, reminder_date, status \
                                        ORDER BY stage desc, reminder_date asc , id asc \
                                    ").fetchall()

            con.close()
            
            for i in range(len(result_list)):
                response_data['result'].append({
                                            'id': result_list[i][0],
                                            'title': result_list[i][1],
                                            'description': result_list[i][2],
                                            'duedate': result_list[i][3],
                                            'reminder_date': result_list[i][4],
                                            'status': result_list[i][5],
                                            'stage': result_list[i][6]
                                            })
            response_data['message'] = 'success'
            response_data['total'] = len(result_list)
                
        else:
            response_data['result'] = {
                                        'message': "no parameters provided."
                                        }        
            
        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/update_homework', methods=['GET'])
def get_update_homework():
    try:
        # Get parameters from the query string
        set_assign_id = request.args.get('assign_id')
        set_user_profile_id = request.args.get('user_id')
        set_subject_id = request.args.get('subject_id')
        set_title = request.args.get('title')
        set_description = request.args.get('description')
        set_duedate = request.args.get('duedate')
        set_reminder_date = request.args.get('reminder_date')
        set_status_assign = request.args.get('status_assign')
                
        response_data = {
                'remark': 'GET request update_homework received',
                'user_profile' :{'id': set_user_profile_id},
                'result': []
            }        
        
        db_file = 'db/my_database.db' 
        con = duckdb.connect(database=db_file)
        today_date = datetime.datetime.now()
        str_today = datetime.datetime.strftime(today_date,"%Y-%m-%d %H:%M:%S")
        
        if set_user_profile_id and set_subject_id and set_title and set_description and set_duedate and set_reminder_date:
            ### Update Data ### 
            # Update data to table assignment.
            con.execute(f"UPDATE assignment SET title = '{set_title}', \
                                                description = '{set_description}'\
                                                duedate = '{set_duedate}'\
                                                user_profile_id = '{set_user_profile_id}'\
                                                subject_id = '{set_subject_id}' \
                                WHERE id = '{set_assign_id}'")
            
            # Update data to table assignment_reminders.
            con.execute(f"UPDATE assignment_reminders SET reminder_date = '{set_reminder_date}' \
                                WHERE assign_id = '{set_assign_id}'")
            
            status = True
            
        elif set_status_assign:
            # Update data to table assignment_progress.
            if set_status_assign == 'complete':
                set_completion_date = f"'{str_today}'"
            else:
                set_completion_date = "NULL"
            con.execute(f"UPDATE assignment_progress SET status = '{set_status_assign}', \
                                            complation_date = {set_completion_date} \
                                WHERE assign_id = '{set_assign_id}'")            
                
            status = True    
                           
        else:
            response_data['result'] = {
                                        'message': "no parameters provided."
                                        }        

            status = False
        
        if status:
            ### Select Homework list ###
            #str_today = '2025-02-16'
            result_list = con.execute(f"SELECT id, title, description, CAST(duedate AS DATE) AS duedate, \
                                                CAST(reminder_date AS DATE) AS reminder_date, status \
                                                , CASE WHEN CAST(reminder_date AS DATE) < CAST('{str_today}' AS DATE) THEN \
                                                            CASE WHEN CAST(duedate AS DATE) < CAST('{str_today}' AS DATE) THEN '3' \
                                                                ELSE '2' END \
                                                    ELSE '1' END AS stage \
                                        FROM (SELECT asm.*, rd.reminder_date, pg.status, pg.completion_date FROM assignment asm \
                                                LEFT JOIN assignment_reminders rd ON asm.id = rd.assign_id \
                                                LEFT JOIN assignment_progress pg ON asm.id = pg.assign_id AND pg.status <> 'complete' \
                                                WHERE asm.user_profile_id = '{set_user_profile_id}' )  \
                                        GROUP BY id,title, description, duedate, reminder_date, status \
                                        ORDER BY stage desc, reminder_date asc , id asc \
                                    ").fetchall()

            con.close()
            
            for i in range(len(result_list)):
                response_data['result'].append({
                                            'id': result_list[i][0],
                                            'title': result_list[i][1],
                                            'description': result_list[i][2],
                                            'duedate': result_list[i][3],
                                            'reminder_date': result_list[i][4],
                                            'status': result_list[i][5],
                                            'stage': result_list[i][6]
                                            })
            response_data['message'] = 'success'
            response_data['total'] = len(result_list)
                
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
        
        db_file = 'db/my_database.db' 
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
            #str_today = '2025-02-16'
            result_list = con.execute(f"SELECT id, title, description, CAST(duedate AS DATE) AS duedate, \
                                                CAST(reminder_date AS DATE) AS reminder_date, status \
                                                , CASE WHEN CAST(reminder_date AS DATE) < CAST('{str_today}' AS DATE) THEN \
                                                            CASE WHEN CAST(duedate AS DATE) < CAST('{str_today}' AS DATE) THEN '3' \
                                                                ELSE '2' END \
                                                    ELSE '1' END AS stage \
                                        FROM (SELECT asm.*, rd.reminder_date, pg.status, pg.completion_date FROM assignment asm \
                                                LEFT JOIN assignment_reminders rd ON asm.id = rd.assign_id \
                                                LEFT JOIN assignment_progress pg ON asm.id = pg.assign_id AND pg.status <> 'complete' \
                                                WHERE asm.user_profile_id = '{set_user_profile_id}' )  \
                                        GROUP BY id,title, description, duedate, reminder_date, status \
                                        ORDER BY stage desc, reminder_date asc , id asc \
                                    ").fetchall()

            con.close()
            
            for i in range(len(result_list)):
                response_data['result'].append({
                                            'id': result_list[i][0],
                                            'title': result_list[i][1],
                                            'description': result_list[i][2],
                                            'duedate': result_list[i][3],
                                            'reminder_date': result_list[i][4],
                                            'status': result_list[i][5],
                                            'stage': result_list[i][6]
                                            })
            response_data['message'] = 'success'
            response_data['total'] = len(result_list)
                
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