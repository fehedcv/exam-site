from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List
import random
import json
from datetime import datetime
import os
import uuid

app = FastAPI(title="Quiz API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create quizzes directory if it doesn't exist
os.makedirs("quizzes", exist_ok=True)

# Sample questions dictionary (you can replace this with your own)
QUESTIONS_DB = {
    1: {
        "question": "What is the capital of France?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "answer": "Paris"
    },
    2: {
        "question": "Which planet is known as the Red Planet?",
        "options": ["Venus", "Mars", "Jupiter", "Saturn"],
        "answer": "Mars"
    },
    3: {
        "question": "What is 2 + 2?",
        "options": ["3", "4", "5", "6"],
        "answer": "4"
    },
    4: {
        "question": "Who wrote 'Romeo and Juliet'?",
        "options": ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        "answer": "William Shakespeare"
    },
    5: {
        "question": "What is the largest mammal in the world?",
        "options": ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
        "answer": "Blue Whale"
    },
    6: {
        "question": "Which programming language is known for its use in web development?",
        "options": ["C++", "Java", "JavaScript", "Assembly"],
        "answer": "JavaScript"
    },
    7: {
        "question": "What is the chemical symbol for gold?",
        "options": ["Go", "Gd", "Au", "Ag"],
        "answer": "Au"
    },
    8: {
        "question": "Which year did World War II end?",
        "options": ["1944", "1945", "1946", "1947"],
        "answer": "1945"
    },
    9: {
        "question": "What is the smallest prime number?",
        "options": ["0", "1", "2", "3"],
        "answer": "2"
    },
    10: {
        "question": "Which continent is the largest by area?",
        "options": ["Africa", "Asia", "North America", "Europe"],
        "answer": "Asia"
    },
    11: {
        "question": "What is the speed of light in vacuum?",
        "options": ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
        "answer": "300,000 km/s"
    },
    12: {
        "question": "Who painted the Mona Lisa?",
        "options": ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        "answer": "Leonardo da Vinci"
    },
    13: {
        "question": "What is the currency of Japan?",
        "options": ["Yuan", "Won", "Yen", "Rupee"],
        "answer": "Yen"
    },
    14: {
        "question": "Which gas makes up most of Earth's atmosphere?",
        "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        "answer": "Nitrogen"
    },
    15: {
        "question": "What is the hardest natural substance on Earth?",
        "options": ["Gold", "Iron", "Diamond", "Platinum"],
        "answer": "Diamond"
    },
    16: {
        "question": "Which ocean is the largest?",
        "options": ["Atlantic", "Indian", "Arctic", "Pacific"],
        "answer": "Pacific"
    },
    17: {
        "question": "What is the square root of 64?",
        "options": ["6", "7", "8", "9"],
        "answer": "8"
    },
    18: {
        "question": "Who developed the theory of relativity?",
        "options": ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Stephen Hawking"],
        "answer": "Albert Einstein"
    },
    19: {
        "question": "What is the longest river in the world?",
        "options": ["Amazon", "Nile", "Mississippi", "Yangtze"],
        "answer": "Nile"
    },
    20: {
        "question": "Which element has the chemical symbol 'O'?",
        "options": ["Gold", "Silver", "Oxygen", "Iron"],
        "answer": "Oxygen"
    },
    21: {
        "question": "What is the capital of Australia?",
        "options": ["Sydney", "Melbourne", "Canberra", "Perth"],
        "answer": "Canberra"
    },
    22: {
        "question": "How many sides does a hexagon have?",
        "options": ["5", "6", "7", "8"],
        "answer": "6"
    },
    23: {
        "question": "Which planet is closest to the Sun?",
        "options": ["Venus", "Earth", "Mercury", "Mars"],
        "answer": "Mercury"
    },
    24: {
        "question": "What is the largest organ in the human body?",
        "options": ["Heart", "Brain", "Liver", "Skin"],
        "answer": "Skin"
    },
    25: {
        "question": "Who wrote '1984'?",
        "options": ["George Orwell", "Aldous Huxley", "Ray Bradbury", "H.G. Wells"],
        "answer": "George Orwell"
    },
    26: {
        "question": "What is the boiling point of water at sea level?",
        "options": ["90°C", "95°C", "100°C", "105°C"],
        "answer": "100°C"
    },
    27: {
        "question": "Which country is known as the Land of the Rising Sun?",
        "options": ["China", "Japan", "South Korea", "Thailand"],
        "answer": "Japan"
    },
    28: {
        "question": "What is the smallest country in the world?",
        "options": ["Monaco", "Nauru", "Vatican City", "San Marino"],
        "answer": "Vatican City"
    },
    29: {
        "question": "How many bones are in an adult human body?",
        "options": ["196", "206", "216", "226"],
        "answer": "206"
    },
    30: {
        "question": "What is the most abundant gas in the universe?",
        "options": ["Oxygen", "Helium", "Hydrogen", "Nitrogen"],
        "answer": "Hydrogen"
    },
    31: {
        "question": "Which instrument measures atmospheric pressure?",
        "options": ["Thermometer", "Barometer", "Hygrometer", "Anemometer"],
        "answer": "Barometer"
    },
    32: {
        "question": "What is the chemical formula for water?",
        "options": ["H2O", "CO2", "NaCl", "CH4"],
        "answer": "H2O"
    },
    33: {
        "question": "Which vitamin is produced when skin is exposed to sunlight?",
        "options": ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
        "answer": "Vitamin D"
    },
    34: {
        "question": "What is the tallest mountain in the world?",
        "options": ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"],
        "answer": "Mount Everest"
    },
    35: {
        "question": "Which blood type is known as the universal donor?",
        "options": ["A", "B", "AB", "O"],
        "answer": "O"
    }
}

# Pydantic models
class Question(BaseModel):
    id: int
    question: str
    options: List[str]
    answer: str

class QuizSubmission(BaseModel):
    name: str
    rollNumber: str
    quizId: str
    answers: Dict[int, str]

class QuizResult(BaseModel):
    name: str
    rollNumber: str
    score: int
    totalQuestions: int
    questions: List[Question]
    userAnswers: Dict[int, str]

class CheatReport(BaseModel):
    name: str
    rollNumber: str
    ip: str = "Unknown"
    cheatMethod: str
    timestamp: str

class Quiz(BaseModel):
    id: str
    name: str
    description: str
    questions: List[Question]
    createdAt: str
    isActive: bool = True

class CreateQuizRequest(BaseModel):
    name: str
    description: str
    questions: List[Dict]

def load_quiz(quiz_id: str) -> Quiz:
    """Load a quiz from file"""
    quiz_file = f"quizzes/{quiz_id}.json"
    if not os.path.exists(quiz_file):
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    with open(quiz_file, "r", encoding="utf-8") as f:
        quiz_data = json.load(f)
    
    return Quiz(**quiz_data)

def save_quiz(quiz: Quiz):
    """Save a quiz to file"""
    quiz_file = f"quizzes/{quiz.id}.json"
    with open(quiz_file, "w", encoding="utf-8") as f:
        json.dump(quiz.dict(), f, indent=2, ensure_ascii=False)

def get_all_quizzes() -> List[Quiz]:
    """Get all quizzes from the quizzes directory"""
    quizzes = []
    if not os.path.exists("quizzes"):
        return quizzes
    
    for filename in os.listdir("quizzes"):
        if filename.endswith(".json"):
            quiz_id = filename[:-5]  # Remove .json extension
            try:
                quiz = load_quiz(quiz_id)
                quizzes.append(quiz)
            except:
                continue
    
    return sorted(quizzes, key=lambda x: x.createdAt, reverse=True)

@app.get("/questions", response_model=List[Question])
async def get_questions():
    """Get 15 random questions from the default database"""
    try:
        # Select 15 random questions
        selected_ids = random.sample(list(QUESTIONS_DB.keys()), min(15, len(QUESTIONS_DB)))
        
        questions = []
        for qid in selected_ids:
            q_data = QUESTIONS_DB[qid]
            questions.append(Question(
                id=qid,
                question=q_data["question"],
                options=q_data["options"],
                answer=q_data["answer"]
            ))
        
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching questions: {str(e)}")

@app.get("/questions/{quiz_id}", response_model=List[Question])
async def get_quiz_questions(quiz_id: str):
    """Get 15 random questions from a specific quiz"""
    try:
        quiz = load_quiz(quiz_id)
        if not quiz.isActive:
            raise HTTPException(status_code=400, detail="Quiz is not active")
        
        # Select up to 15 random questions from the quiz
        num_questions = min(30, len(quiz.questions))
        selected_questions = random.sample(quiz.questions, num_questions)
        
        return selected_questions
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quiz questions: {str(e)}")

@app.post("/submit", response_model=QuizResult)
async def submit_quiz(submission: QuizSubmission):
    """Submit quiz answers and get results"""
    try:
        # Load the quiz to get questions
        quiz = load_quiz(submission.quizId)
        quiz_questions = {q.id: q for q in quiz.questions}
        
        # Calculate score
        score = 0
        questions = []
        
        for qid, user_answer in submission.answers.items():
            if qid in quiz_questions:
                q_data = quiz_questions[qid]
                if user_answer == q_data.answer:
                    score += 1
                
                questions.append(Question(
                    id=qid,
                    question=q_data.question,
                    options=q_data.options,
                    answer=q_data.answer
                ))
        
        # Save result to file
        result_data = {
            "name": submission.name,
            "rollNumber": submission.rollNumber,
            "quizId": submission.quizId,
            "quizName": quiz.name,
            "score": score,
            "totalQuestions": len(submission.answers),
            "timestamp": datetime.now().isoformat(),
            "answers": submission.answers
        }
        
        # Append to results.txt
        with open("results.txt", "a", encoding="utf-8") as f:
            f.write(json.dumps(result_data) + "\n")
        
        return QuizResult(
            name=submission.name,
            rollNumber=submission.rollNumber,
            score=score,
            totalQuestions=len(submission.answers),
            questions=questions,
            userAnswers=submission.answers
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting quiz: {str(e)}")

@app.post("/report-cheat")
async def report_cheat(cheat_report: CheatReport):
    """Report cheating incident"""
    try:
        cheat_data = {
            "name": cheat_report.name,
            "rollNumber": cheat_report.rollNumber,
            "ip": cheat_report.ip,
            "cheatMethod": cheat_report.cheatMethod,
            "timestamp": cheat_report.timestamp
        }
        
        # Append to cheating_reports.txt
        with open("cheating_reports.txt", "a", encoding="utf-8") as f:
            f.write(json.dumps(cheat_data) + "\n")
        
        return {"message": "Cheat report recorded successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reporting cheat: {str(e)}")

@app.get("/admin/results")
async def get_admin_results():
    """Get all quiz results for admin dashboard"""
    try:
        results = []
        if os.path.exists("results.txt"):
            with open("results.txt", "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        try:
                            result = json.loads(line.strip())
                            results.append(result)
                        except json.JSONDecodeError:
                            continue
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching results: {str(e)}")

@app.get("/admin/results/{quiz_id}")
async def get_quiz_results(quiz_id: str):
    """Get results for a specific quiz"""
    try:
        results = []
        if os.path.exists("results.txt"):
            with open("results.txt", "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        try:
                            result = json.loads(line.strip())
                            if result.get("quizId") == quiz_id:
                                results.append(result)
                        except json.JSONDecodeError:
                            continue
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quiz results: {str(e)}")

@app.get("/admin/cheats")
async def get_admin_cheats():
    """Get all cheat reports for admin dashboard"""
    try:
        cheats = []
        if os.path.exists("cheating_reports.txt"):
            with open("cheating_reports.txt", "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        try:
                            cheat = json.loads(line.strip())
                            cheats.append(cheat)
                        except json.JSONDecodeError:
                            continue
        return cheats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching cheat reports: {str(e)}")

@app.get("/admin/quizzes", response_model=List[Quiz])
async def get_admin_quizzes():
    """Get all quizzes for admin dashboard"""
    try:
        return get_all_quizzes()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quizzes: {str(e)}")

@app.post("/admin/quizzes", response_model=Quiz)
async def create_quiz(quiz_request: CreateQuizRequest):
    """Create a new quiz"""
    try:
        quiz_id = str(uuid.uuid4())
        
        # Convert questions to proper format with IDs
        questions = []
        for i, q in enumerate(quiz_request.questions, 1):
            questions.append(Question(
                id=i,
                question=q["question"],
                options=q["options"],
                answer=q["answer"]
            ))
        
        quiz = Quiz(
            id=quiz_id,
            name=quiz_request.name,
            description=quiz_request.description,
            questions=questions,
            createdAt=datetime.now().isoformat(),
            isActive=True
        )
        
        save_quiz(quiz)
        return quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating quiz: {str(e)}")

@app.delete("/admin/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: str):
    """Delete a quiz"""
    try:
        quiz_file = f"quizzes/{quiz_id}.json"
        if not os.path.exists(quiz_file):
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        os.remove(quiz_file)
        return {"message": "Quiz deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting quiz: {str(e)}")

@app.patch("/admin/quizzes/{quiz_id}/toggle", response_model=Quiz)
async def toggle_quiz_status(quiz_id: str):
    """Toggle quiz active status"""
    try:
        quiz = load_quiz(quiz_id)
        quiz.isActive = not quiz.isActive
        save_quiz(quiz)
        return quiz
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error toggling quiz status: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Quiz API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)