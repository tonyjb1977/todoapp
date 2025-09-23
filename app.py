from flask import Flask, render_template, url_for, flash, redirect, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'

db = SQLAlchemy(app)

#------- Creat database Models -------#
# User table
class User(db.Model):
    username = db.Column(db.String(20), unique=True, nullable=False, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(30), nullable=False)
    last_name = db.Column(db.String(30), nullable=False)                
    password = db.Column(db.String(60), nullable=False)
    
    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

class RegistrationForm(db):
    

class LoginForm(FlaskForm):
    


#--------Home route--------#
@app.route("/")
def index():
    if 'user_id' in session:
        user = User.query.filter_by(username=session['user_id']).first()
        return render_template('index.html', user=user)
    return render_template('index.html')

#--------Register route--------#
@app.route("/register", methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        if form.validate_on_submit():
            user = User(username=form.username.data, email=form.email.data, first_name=form.first_name.data, last_name=form.last_name.data, password=form.password.data)
            db.session.add(user)
            db.session.commit()
            flash('Your account has been created! You can now log in.', 'success')
            return redirect(url_for('login'))
    return render_template('signup.html', title='register')


#--------Login route--------#
@app.route("/login", methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data
        user = User.query.filter_by(email=form.email.data).first()
            if user and user.password == form.password.data:
                session['user_id'] = user.username
                flash('You have been logged in!', 'success')
                return redirect(url_for('index'))
            else:
                flash('Login Unsuccessful. Please check email and password', 'danger')
    return render_template('login.html', title='login')

# -------Log out route------- #
@app.route("/logout")
def logout():
    session.pop('user_id', None)
    flash('You have been logged out!', 'info')
    return redirect(url_for('index'))


#start the server with: python run.py
if __name__ == '__main__':
    app.run(debug=True)
    with app.app_context():
        db.create_all()
