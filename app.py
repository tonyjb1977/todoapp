from flask import Flask, render_template, url_for, flash, redirect, request, session
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'

db = SQLAlchemy(app)

# ------- Create database Models ------- #
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(30), nullable=False)
    last_name = db.Column(db.String(30), nullable=False)
    password = db.Column(db.String(60), nullable=False)

    def __repr__(self):
     return f"User('{self.first_name} {self.last_name}', '{self.email}')"

# -------- Home route -------- #
@app.route("/")
def index():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        return render_template('index.html', user=user)
    return render_template('index.html')

# -------- Register route -------- #
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        print("📥 收到注册表单：", request.form)  # 调试

        email = request.form.get("email")
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        password = request.form.get("password")

        if not email or not first_name or not last_name or not password:
            flash("Please fill all fields", "danger")
            return redirect(url_for("register"))

        try:
            user = User(
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=password 
            )
            db.session.add(user)
            db.session.commit()
            print("✅ 用户已写入数据库:", user)
            flash("Account created successfully! Please login.", "success")
            return redirect(url_for("login"))
        except Exception as e:
            db.session.rollback()
            print("❌ 数据库错误:", e)
            flash("Registration failed, please try again.", "danger")
            return redirect(url_for("register"))

    return render_template("signup.html")



# -------- Login route -------- #
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        user = User.query.filter_by(email=email).first()
        if user and user.password == password:
            session["user_id"] = user.id
            flash("Login successful!", "success")
            return redirect(url_for("index"))
        else:
            flash("Invalid email or password", "danger")

    return render_template("login.html")


# ------- Log out route ------- #
@app.route("/logout")
def logout():
    session.pop('user_id', None)
    flash('You have been logged out!', 'info')
    return redirect(url_for('index'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

