# Quiz Backend API

This is the FastAPI backend for the quiz application.

## Setup

1. Install Python 3.8 or higher
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   python main.py
   ```

The server will start on `http://localhost:8000`

## API Endpoints

- `GET /questions` - Get 15 random questions
- `POST /submit` - Submit quiz answers
- `POST /report-cheat` - Report cheating incidents
- `GET /` - Health check

## Files Created

- `results.txt` - Stores quiz results
- `cheating_reports.txt` - Stores cheating incidents

## Question Format

Questions are stored in the `QUESTIONS_DB` dictionary with the following format:

```python
{
    question_id: {
        "question": "Question text",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "answer": "Correct answer"
    }
}
```

You can modify the `QUESTIONS_DB` dictionary in `main.py` to add your own questions.