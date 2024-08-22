
from flask import Flask, send_file
from pymongo import MongoClient
import matplotlib.pyplot as plt
import io

app = Flask(__name__)

# MongoDB setup
client = MongoClient(
    'mongodb+srv://jidaar718:tRelmEXYu7NEcGFz@cluster0.j9n5kuh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
)
db = client["jabbas"]
collection = db["scores"]

@app.route('/plot.png')
def plot_png():
    # Fetch marks data from MongoDB
    marks_data = collection.find({}, {"_id": 0, "marks": 1})
    marks = [data["marks"] for data in marks_data]
    
    # Create scatter plot
    indices = range(1, len(marks) + 1)
    plt.figure(figsize=(8, 6))
    plt.plot(indices, marks, color='skyblue', marker='o', linestyle='-')
    plt.title('Line Chart of Marks')
    plt.xlabel('Student Index')
    plt.ylabel('Marks')
    plt.grid(True)
    
    # Save plot to a BytesIO object
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()
    
    return send_file(img, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
