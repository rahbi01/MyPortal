from app import app, db
from werkzeug.security import generate_password_hash
from datetime import date

with app.app_context():
    db.drop_all()
    db.create_all()
    
    # إنشاء مستخدم أدمن
    admin = User(
        username='admin',
        password=generate_password_hash('admin123'),
        full_name='مدير النظام',
        role='admin'
    )
    
    # إنشاء مستخدم عادي
    user = User(
        username='user',
        password=generate_password_hash('user123'),
        full_name='موظف عادي',
        role='user'
    )
    
    db.session.add(admin)
    db.session.add(user)
    db.session.commit()
    
    # إضافة بعض البيانات التجريبية
    dept1 = Department(code='MATH', name='قسم الرياضيات')
    dept2 = Department(code='SCI', name='قسم العلوم')
    db.session.add(dept1)
    db.session.add(dept2)
    
    service1 = Service(name='صيانة أجهزة')
    service2 = Service(name='تطوير برمجيات')
    db.session.add(service1)
    db.session.add(service2)
    
    system1 = System(name='نظام إدارة المدارس')
    system2 = System(name='نظام الموارد البشرية')
    db.session.add(system1)
    db.session.add(system2)
    
    channel1 = RequestChannel(name='البوابة الإلكترونية')
    channel2 = RequestChannel(name='تطبيق الجوال')
    db.session.add(channel1)
    db.session.add(channel2)
    
    db.session.commit()
    print("تم إنشاء قاعدة البيانات بنجاح!")
    print("مستخدم أدمن: admin / admin123")
    print("مستخدم عادي: user / user123")
