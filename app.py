from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import pandas as pd
import os
from dateutil import parser

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///orders.db'
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# ==================== النماذج (Models) ====================

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin' or 'user'
    is_active = db.Column(db.Boolean, default=True)

class Department(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True)
    name = db.Column(db.String(200), nullable=False)

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)

class System(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)

class RequestChannel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)

class Holiday(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, unique=True, nullable=False)
    name = db.Column(db.String(200))

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'))
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'))
    system_id = db.Column(db.Integer, db.ForeignKey('system.id'))
    channel_id = db.Column(db.Integer, db.ForeignKey('request_channel.id'))
    receive_date = db.Column(db.Date, nullable=False)
    response_date = db.Column(db.Date, nullable=False)
    details = db.Column(db.Text)
    working_days = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='orders')
    department = db.relationship('Department')
    service = db.relationship('Service')
    system = db.relationship('System')
    channel = db.relationship('RequestChannel')

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# ==================== دوال مساعدة ====================

def calculate_working_days(start_date, end_date):
    """حساب أيام العمل مع استبعاد الجمعة والسبت والعطل الرسمية"""
    holidays = [h.date for h in Holiday.query.all()]
    current = start_date
    days = 0
    
    while current <= end_date:
        # استبعاد الجمعة (4) والسبت (5) حيث Monday=0
        if current.weekday() not in [4, 5] and current not in holidays:
            days += 1
        current += timedelta(days=1)
    return days

# ==================== مسارات التطبيق ====================

@app.route('/')
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password, password):
            login_user(user)
            if user.role == 'admin':
                return redirect(url_for('admin_dashboard'))
            else:
                return redirect(url_for('user_dashboard'))
        flash('اسم المستخدم أو كلمة المرور غير صحيحة')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# ==================== لوحة تحكم الأدمن ====================

@app.route('/admin')
@login_required
def admin_dashboard():
    if current_user.role != 'admin':
        return redirect(url_for('user_dashboard'))
    
    users = User.query.filter_by(role='user').all()
    departments = Department.query.all()
    services = Service.query.all()
    systems = System.query.all()
    channels = RequestChannel.query.all()
    holidays = Holiday.query.all()
    
    return render_template('admin_dashboard.html', 
                         users=users, 
                         departments=departments,
                         services=services,
                         systems=systems,
                         channels=channels,
                         holidays=holidays)

# إدارة المستخدمين
@app.route('/admin/add_user', methods=['POST'])
@login_required
def add_user():
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.form
    hashed_password = generate_password_hash(data['password'])
    user = User(username=data['username'], 
                password=hashed_password,
                full_name=data['full_name'],
                role='user')
    db.session.add(user)
    db.session.commit()
    flash('تم إضافة المستخدم بنجاح')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/edit_user/<int:user_id>', methods=['POST'])
@login_required
def edit_user(user_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    user.full_name = request.form['full_name']
    if request.form['password']:
        user.password = generate_password_hash(request.form['password'])
    db.session.commit()
    flash('تم تعديل المستخدم بنجاح')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/delete_user/<int:user_id>')
@login_required
def delete_user(user_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    flash('تم حذف المستخدم بنجاح')
    return redirect(url_for('admin_dashboard'))

# إدارة الأقسام
@app.route('/admin/add_department', methods=['POST'])
@login_required
def add_department():
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    dept = Department(code=request.form['code'], name=request.form['name'])
    db.session.add(dept)
    db.session.commit()
    flash('تم إضافة القسم بنجاح')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/import_departments', methods=['POST'])
@login_required
def import_departments():
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    if 'file' not in request.files:
        flash('لم يتم اختيار ملف')
        return redirect(url_for('admin_dashboard'))
    
    file = request.files['file']
    if file.filename == '':
        flash('لم يتم اختيار ملف')
        return redirect(url_for('admin_dashboard'))
    
    if file and file.filename.endswith(('.xlsx', '.xls')):
        df = pd.read_excel(file)
        # نتوقع وجود عمودين: code و name
        for _, row in df.iterrows():
            dept = Department(code=str(row['code']), name=row['name'])
            db.session.add(dept)
        db.session.commit()
        flash('تم استيراد الأقسام بنجاح')
    else:
        flash('الملف غير مدعوم. يرجى رفع ملف Excel')
    
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/edit_department/<int:dept_id>', methods=['POST'])
@login_required
def edit_department(dept_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    dept = Department.query.get_or_404(dept_id)
    dept.code = request.form['code']
    dept.name = request.form['name']
    db.session.commit()
    flash('تم تعديل القسم بنجاح')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/delete_department/<int:dept_id>')
@login_required
def delete_department(dept_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    dept = Department.query.get_or_404(dept_id)
    db.session.delete(dept)
    db.session.commit()
    flash('تم حذف القسم بنجاح')
    return redirect(url_for('admin_dashboard'))

# دوال مشابهة لإدارة الخدمات والأنظمة وقنوات الطلب والعطل الرسمية
@app.route('/admin/add_service', methods=['POST'])
@login_required
def add_service():
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    service = Service(name=request.form['name'])
    db.session.add(service)
    db.session.commit()
    flash('تم إضافة الخدمة بنجاح')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/edit_service/<int:service_id>', methods=['POST'])
@login_required
def edit_service(service_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    service = Service.query.get_or_404(service_id)
    service.name = request.form['name']
    db.session.commit()
    flash('تم تعديل الخدمة بنجاح')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/delete_service/<int:service_id>')
@login_required
def delete_service(service_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    service = Service.query.get_or_404(service_id)
    db.session.delete(service)
    db.session.commit()
    flash('تم حذف الخدمة بنجاح')
    return redirect(url_for('admin_dashboard'))

# الأنظمة
@app.route('/admin/add_system', methods=['POST'])
@login_required
def add_system():
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    system = System(name=request.form['name'])
    db.session.add(system)
    db.session.commit()
    flash('تم إضافة النظام بنجاح')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/edit_system/<int:system_id>', methods=['POST'])
@login_required
def edit_system(system_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    system = System.query.get_or_404(system_id)
    system.name = request.form['name']
    db.session.commit()
    flash('تم تعديل النظام بنجاح')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/delete_system/<int:system_id>')
@login_required
def delete_system(system_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    system = System.query.get_or_404(system_id)
    db.session.delete(system)
    db.session.commit()
    flash('تم حذف النظام بنجاح')
    return redirect(url_for('admin_dashboard'))

# قنوات الطلب
@app.route('/admin/add_channel', methods=['POST'])
@login_required
def add_channel():
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    channel = RequestChannel(name=request.form['name'])
    db.session.add(channel)
    db.session.commit()
    flash('تم إضافة قناة الطلب بنجاح')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/edit_channel/<int:channel_id>', methods=['POST'])
@login_required
def edit_channel(channel_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    channel = RequestChannel.query.get_or_404(channel_id)
    channel.name = request.form['name']
    db.session.commit()
    flash('تم تعديل قناة الطلب بنجاح')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/delete_channel/<int:channel_id>')
@login_required
def delete_channel(channel_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    channel = RequestChannel.query.get_or_404(channel_id)
    db.session.delete(channel)
    db.session.commit()
    flash('تم حذف قناة الطلب بنجاح')
    return redirect(url_for('admin_dashboard'))

# العطل الرسمية
@app.route('/admin/add_holiday', methods=['POST'])
@login_required
def add_holiday():
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    holiday_date = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
    holiday = Holiday(date=holiday_date, name=request.form['name'])
    db.session.add(holiday)
    db.session.commit()
    flash('تم إضافة العطلة بنجاح')
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/delete_holiday/<int:holiday_id>')
@login_required
def delete_holiday(holiday_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    holiday = Holiday.query.get_or_404(holiday_id)
    db.session.delete(holiday)
    db.session.commit()
    flash('تم حذف العطلة بنجاح')
    return redirect(url_for('admin_dashboard'))

# ==================== لوحة تحكم المستخدم ====================

@app.route('/user')
@login_required
def user_dashboard():
    if current_user.role == 'admin':
        return redirect(url_for('admin_dashboard'))
    
    # إحصائيات المستخدم الحالي
    user_orders = Order.query.filter_by(user_id=current_user.id).all()
    user_stats = len(user_orders)
    
    # جميع الطلبات للمدير
    all_orders = Order.query.all() if current_user.role == 'admin' else None
    all_stats = len(all_orders) if all_orders else 0
    
    return render_template('user_dashboard.html', 
                         orders=user_orders,
                         user_stats=user_stats,
                         all_stats=all_stats,
                         role=current_user.role)

@app.route('/add_order', methods=['GET', 'POST'])
@login_required
def add_order():
    if request.method == 'POST':
        receive_date = datetime.strptime(request.form['receive_date'], '%Y-%m-%d').date()
        response_date = datetime.strptime(request.form['response_date'], '%Y-%m-%d').date()
        
        # حساب أيام العمل
        working_days = calculate_working_days(receive_date, response_date)
        
        order = Order(
            user_id=current_user.id,
            department_id=int(request.form['department_id']),
            service_id=int(request.form['service_id']),
            system_id=int(request.form['system_id']),
            channel_id=int(request.form['channel_id']),
            receive_date=receive_date,
            response_date=response_date,
            details=request.form['details'],
            working_days=working_days
        )
        db.session.add(order)
        db.session.commit()
        flash('تم إضافة الطلب بنجاح')
        return redirect(url_for('user_dashboard'))
    
    departments = Department.query.all()
    services = Service.query.all()
    systems = System.query.all()
    channels = RequestChannel.query.all()
    
    return render_template('add_order.html', 
                         departments=departments,
                         services=services,
                         systems=systems,
                         channels=channels)

# API للبحث
@app.route('/api/search_departments')
@login_required
def search_departments():
    q = request.args.get('q', '')
    departments = Department.query.filter(
        Department.name.contains(q) | Department.code.contains(q)
    ).limit(10).all()
    return jsonify([{'id': d.id, 'name': d.name, 'code': d.code} for d in departments])

if __name__ == '__main__':
    app.run(debug=True)
