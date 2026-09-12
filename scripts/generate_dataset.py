import json
import os
import random
import re
from datetime import datetime, timedelta

# Reproducible seed
SEED = 42
random.seed(SEED)

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MESSAGES_FILE = os.path.join(OUTPUT_DIR, "messages.jsonl")
QUERIES_FILE = os.path.join(OUTPUT_DIR, "queries.json")

PARTICIPANTS = [
    "Abhishek", "Priya", "Rahul", "Neha",
    "Arjun", "Sneha", "Karan", "Riya"
]

# Stopwords for zero-word-overlap normalization validation
ENGLISH_HINDI_STOPWORDS = {
    "a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "by", "from", "up",
    "about", "into", "over", "after", "is", "am", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "but", "and", "or", "if",
    "because", "as", "until", "while", "that", "which", "who", "whom", "this", "these",
    "those", "then", "just", "so", "than", "such", "both", "through", "during", "before",
    "under", "again", "further", "once", "here", "there", "when", "where", "why", "how",
    "all", "any", "each", "few", "more", "most", "other", "some", "no", "nor", "not",
    "only", "own", "same", "so", "than", "too", "very", "can", "will", "should", "now",
    "we", "you", "he", "she", "it", "they", "them", "my", "your", "his", "her", "our",
    "hai", "hain", "ko", "se", "ka", "ki", "ke", "ne", "me", "main", "ye", "wo"
}

def normalize_text(text: str) -> set:
    text = text.lower()
    words = re.findall(r'\b[a-z0-9]+\b', text)
    filtered = {w for w in words if w not in ENGLISH_HINDI_STOPWORDS and len(w) > 1}
    return filtered

def count_overlap(text1: str, text2: str) -> int:
    return len(normalize_text(text1).intersection(normalize_text(text2)))

def generate_chat_corpus():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    start_date = datetime(2026, 1, 10, 9, 0, 0)
    current_time = start_date
    
    messages = []
    msg_counter = 1
    
    # Anchor target messages for specific threads & queries
    # Target 1: Trip decision (Jan 18, 2026)
    trip_dec_id = "msg_000450"
    # Target 2: Hackathon idea decision (Feb 14, 2026)
    hack_dec_id = "msg_001250"
    # Target 3: Camera purchase decision (Mar 22, 2026)
    equip_dec_id = "msg_002100"
    
    # Target 4: Hotel manager (Jan 18, 2026)
    hotel_mgr_id = "msg_000442"
    # Target 5: Cost per head (Jan 18, 2026)
    cost_head_id = "msg_000448"
    # Target 6: Sneha pocket money (Jan 15, 2026)
    budget_concern_id = "msg_000380"
    # Target 7: Hackathon deadline (Feb 14, 2026)
    deadline_id = "msg_001242"
    # Target 8: Meeting point (Feb 12, 2026)
    meet_point_id = "msg_001180"

    # Templates for general chatter
    casual_chat = [
        "haan bhai sab badhiya", "good morning guys!", "kal ka kya plan hai?",
        "main thoda busy hu aaj", "chal chai peete hain", "lol true", "haha so real",
        "bhai ye assignment submit kar diya?", "link share karna ek baar",
        "<Media omitted>", "done bro", "okay 👍", "great news!", "sahi hai yaar",
        "aaj mausam bhot mast hai", "traffic bohot hai aaj", "subah subah kon uthta hai",
        "good night offline ja rha hu", "forwarded message: mandatory college notice",
        "bro python script run nahi ho rahi", "check Discord once", "meeting join karlo",
        "bhai party kab de rha hai?", "treat pending hai teri", "haan haan bilkul"
    ]
    
    hinglish_fillers = [
        "bhai kal milte?", "haan bro done", "budget thoda tight hai", "main dekh lunga",
        "ticket book ho gayi", "ye wala better lag raha", "chalo final karte hain",
        "nahi yaar ye expensive hai", "Saturday ko nikalte hain", "kisi ne updates dekhe?",
        "batao kya scene hai", "abhi tak confirmed nahi hai kya?", "let me know"
    ]

    total_target = 4200
    
    # Generate timestamp steps
    for i in range(1, total_target + 1):
        msg_id = f"msg_{i:06d}"
        
        # Advance time realistically
        time_jump_seconds = random.choice([15, 30, 45, 60, 120, 300, 900, 1800, 3600, 7200, 14400])
        # Late night gap
        if current_time.hour >= 23 or current_time.hour < 7:
            if random.random() < 0.8:
                current_time += timedelta(hours=random.randint(6, 9))
                current_time = current_time.replace(hour=8, minute=random.randint(0, 59))
        current_time += timedelta(seconds=time_jump_seconds)
        
        sender = random.choice(PARTICIPANTS)
        thread_id = f"thread_general_{i // 100}"
        msg_type = "text"
        is_forwarded = False
        reply_to = None
        
        # Inject exact anchor messages at specific indices
        if i == 380:
            msg_id = budget_concern_id
            sender = "Sneha"
            text = "iss month pocket money thodi kam hai yaar, overall expense limit me rakhna"
            thread_id = "thread_trip_plan"
        elif i == 442:
            msg_id = hotel_mgr_id
            sender = "Rahul"
            text = "room booking mera department hai, bilkul tension mat lo"
            thread_id = "thread_trip_plan"
        elif i == 448:
            msg_id = cost_head_id
            sender = "Priya"
            text = "per head 8500 ka expense aayega total stay aur travel milakar"
            thread_id = "thread_trip_plan"
        elif i == 450:
            msg_id = trip_dec_id
            sender = "Rahul"
            text = "Done, Saturday morning wali Manali Volvo confirm kar di."
            thread_id = "thread_trip_plan"
        elif i == 1180:
            msg_id = meet_point_id
            sender = "Karan"
            text = "CP metro station gate number 2 ke paas ikatha hote hain"
            thread_id = "thread_hackathon_project"
        elif i == 1242:
            msg_id = deadline_id
            sender = "Arjun"
            text = "Sunday raat 11:59 PM tak code push karna padega Devpost par"
            thread_id = "thread_hackathon_project"
        elif i == 1250:
            msg_id = hack_dec_id
            sender = "Abhishek"
            text = "Bas, hackathon ka AI search engine lock karte hain."
            thread_id = "thread_hackathon_project"
        elif i == 2100:
            msg_id = equip_dec_id
            sender = "Arjun"
            text = "Main card swiping kar deta hu, sab GPay kar dena."
            thread_id = "thread_equipment_purchase"
        # Synthetic conversation context around thread 1 (Trip)
        elif 400 <= i <= 460:
            thread_id = "thread_trip_plan"
            if i < 440:
                text = random.choice([
                    "Manali chalet hain ki Shimla?", "bhai Goa bohot hot hoga Feb me",
                    "train ticket nahi mil rhi, bus better rahegi", "Volvo sleeper book kare?",
                    "budget 10k tak ho sake toh accha hai", "hotel me 3 rooms lagengi"
                ])
            elif i > 450:
                text = random.choice([
                    "perfect bro!", "mast plan hai", "packing shuru kar do",
                    "subah kitne baje milna hai?", "Kashmere Gate ISBT se chalenge"
                ])
            else:
                text = random.choice(casual_chat)
        # Synthetic conversation context around thread 2 (Hackathon)
        elif 1200 <= i <= 1260:
            thread_id = "thread_hackathon_project"
            if i < 1240:
                text = random.choice([
                    "konse track me apply kare?", "AI Search bot sounds awesome",
                    "RAG implementation easily ho jayega FastAPI se", "frontend me React + Vite use kar lenge"
                ])
            elif i > 1250:
                text = random.choice([
                    "great, repository create kar do github par", "main backend setup start karta hu",
                    "UI templates select kar lete hain", "less go 🚀"
                ])
            else:
                text = random.choice(casual_chat)
        # Synthetic conversation context around thread 3 (Equipment purchase)
        elif 2050 <= i <= 2120:
            thread_id = "thread_equipment_purchase"
            if i < 2100:
                text = random.choice([
                    "DSLR camera rent pe le ya buy kare?", "Sony Alpha 6400 is great",
                    "pooled money se buy kar lete hain", "discounts hain Amazon sale pe"
                ])
            elif i > 2100:
                text = random.choice([
                    "payment screenshot group pe bhej dena", "delivery Tuesday tak aayegi",
                    "bill store karke rakhna drive pe", "awesome bro thank you"
                ])
            else:
                text = random.choice(casual_chat)
        else:
            # General noisy chatter
            roll = random.random()
            if roll < 0.35:
                text = random.choice(casual_chat)
            elif roll < 0.65:
                text = random.choice(hinglish_fillers)
            elif roll < 0.75:
                msg_type = "media"
                text = "<Media omitted>"
            elif roll < 0.85:
                is_forwarded = True
                text = f"Forwarded: {random.choice(casual_chat)}"
            elif roll < 0.92:
                msg_type = "link"
                text = f"Check this out: https://github.com/topics/{random.choice(['ai', 'rag', 'vector-search', 'fastapi'])}"
            else:
                text = random.choice(["ok", "haan", "done", "lol", "brb", "yea", "hmmm", "nice"])
                
        msg_obj = {
            "id": msg_id,
            "timestamp": current_time.strftime("%Y-%m-%dT%H:%M:%S"),
            "sender": sender,
            "text": text,
            "thread_id": thread_id,
            "message_type": msg_type,
            "reply_to": reply_to,
            "is_forwarded": is_forwarded
        }
        messages.append(msg_obj)

    # Save messages.jsonl
    with open(MESSAGES_FILE, "w", encoding="utf-8") as f:
        for m in messages:
            f.write(json.dumps(m, ensure_ascii=False) + "\n")
            
    print(f"Generated {len(messages)} synthetic messages in {MESSAGES_FILE}")
    return messages

def generate_benchmark_queries(messages):
    msg_map = {m["id"]: m["text"] for m in messages}
    EVALUATION_QUERIES_FILE = os.path.join(OUTPUT_DIR, "evaluation_queries.json")
    
    queries = [
        # === 16 MEANING / DECISION QUERIES (Q01 - Q16), INCLUDING 8 HARD ZERO-OVERLAP (Q01 - Q08) ===
        {
            "id": "Q01",
            "query_id": "Q01",
            "type": "meaning",
            "category": "meaning",
            "query": "When did everyone settle on the mountain plan?",
            "gold_message_id": "msg_000450",
            "expected_message_id": "msg_000450",
            "hard": True,
            "zero_word_overlap": True,
            "expected_intent": "trip destination decision",
            "expected_answer_summary": "The group finalized Manali for the Volvo bus trip."
        },
        {
            "id": "Q02",
            "query_id": "Q02",
            "type": "meaning",
            "category": "meaning",
            "query": "What did the team ultimately choose to make for the competition?",
            "gold_message_id": "msg_001250",
            "expected_message_id": "msg_001250",
            "hard": True,
            "zero_word_overlap": True,
            "expected_intent": "hackathon project choice",
            "expected_answer_summary": "The team locked the AI search engine project."
        },
        {
            "id": "Q03",
            "query_id": "Q03",
            "type": "meaning",
            "category": "meaning",
            "query": "Who recommended keeping everyone's contribution equal?",
            "gold_message_id": "msg_002100",
            "expected_message_id": "msg_002100",
            "hard": True,
            "zero_word_overlap": True,
            "expected_intent": "equipment payment method",
            "expected_answer_summary": "Arjun offered to swipe card and asked everyone to GPay."
        },
        {
            "id": "Q04",
            "query_id": "Q04",
            "type": "meaning",
            "category": "meaning",
            "query": "Who agreed to manage the hotel reservation?",
            "gold_message_id": "msg_000442",
            "expected_message_id": "msg_000442",
            "hard": True,
            "zero_word_overlap": True,
            "expected_intent": "accommodation management",
            "expected_answer_summary": "Rahul took charge of room booking."
        },
        {
            "id": "Q05",
            "query_id": "Q05",
            "type": "meaning",
            "category": "meaning",
            "query": "What was the final financial figure calculated for each individual for our vacation?",
            "gold_message_id": "msg_000448",
            "expected_message_id": "msg_000448",
            "hard": True,
            "zero_word_overlap": True,
            "expected_intent": "individual expense calculation",
            "expected_answer_summary": "Priya calculated per head expense of 8500."
        },
        {
            "id": "Q06",
            "query_id": "Q06",
            "type": "meaning",
            "category": "meaning",
            "query": "Did anyone voice concerns regarding budget constraints?",
            "gold_message_id": "msg_000380",
            "expected_message_id": "msg_000380",
            "hard": True,
            "zero_word_overlap": True,
            "expected_intent": "budget limitation request",
            "expected_answer_summary": "Sneha mentioned pocket money constraints."
        },
        {
            "id": "Q07",
            "query_id": "Q07",
            "type": "meaning",
            "category": "meaning",
            "query": "When is the submission deadline for our hackathon project prototype?",
            "gold_message_id": "msg_001242",
            "expected_message_id": "msg_001242",
            "hard": True,
            "zero_word_overlap": True,
            "expected_intent": "project code deadline",
            "expected_answer_summary": "Arjun announced Sunday 11:59 PM code push deadline."
        },
        {
            "id": "Q08",
            "query_id": "Q08",
            "type": "meaning",
            "category": "meaning",
            "query": "What was decided about the meeting location for tomorrow?",
            "gold_message_id": "msg_001180",
            "expected_message_id": "msg_001180",
            "hard": True,
            "zero_word_overlap": True,
            "expected_intent": "gathering point decision",
            "expected_answer_summary": "Karan shared CP metro gate 2 meeting spot."
        },

        # Normal Meaning Queries (Q09 - Q16)
        {
            "id": "Q09",
            "query_id": "Q09",
            "type": "meaning",
            "category": "meaning",
            "query": "When did we decide on the trip?",
            "gold_message_id": "msg_000450",
            "expected_message_id": "msg_000450",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "trip final decision",
            "expected_answer_summary": "Rahul confirmed Saturday Volvo bus booking."
        },
        {
            "id": "Q10",
            "query_id": "Q10",
            "type": "meaning",
            "category": "meaning",
            "query": "What project did we choose for the hackathon?",
            "gold_message_id": "msg_001250",
            "expected_message_id": "msg_001250",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "hackathon choice",
            "expected_answer_summary": "Abhishek locked AI search engine."
        },
        {
            "id": "Q11",
            "query_id": "Q11",
            "type": "meaning",
            "category": "meaning",
            "query": "What did we decide about accommodation?",
            "gold_message_id": "msg_000442",
            "expected_message_id": "msg_000442",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "hotel handling",
            "expected_answer_summary": "Rahul handles room booking."
        },
        {
            "id": "Q12",
            "query_id": "Q12",
            "type": "meaning",
            "category": "meaning",
            "query": "What was the total trip expense per person?",
            "gold_message_id": "msg_000448",
            "expected_message_id": "msg_000448",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "per person expense",
            "expected_answer_summary": "8500 per head calculated by Priya."
        },
        {
            "id": "Q13",
            "query_id": "Q13",
            "type": "meaning",
            "category": "meaning",
            "query": "What equipment purchase was agreed upon?",
            "gold_message_id": "msg_002100",
            "expected_message_id": "msg_002100",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "camera payment",
            "expected_answer_summary": "Card swipe & GPay agreement."
        },
        {
            "id": "Q14",
            "query_id": "Q14",
            "type": "meaning",
            "category": "meaning",
            "query": "Where are we gathering before heading out?",
            "gold_message_id": "msg_001180",
            "expected_message_id": "msg_001180",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "meeting spot",
            "expected_answer_summary": "CP metro gate 2."
        },
        {
            "id": "Q15",
            "query_id": "Q15",
            "type": "meaning",
            "category": "meaning",
            "query": "What is the code push deadline for the hackathon?",
            "gold_message_id": "msg_001242",
            "expected_message_id": "msg_001242",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "code deadline",
            "expected_answer_summary": "Sunday 11:59 PM Devpost push."
        },
        {
            "id": "Q16",
            "query_id": "Q16",
            "type": "meaning",
            "category": "meaning",
            "query": "Did anyone ask to keep trip expenses reasonable?",
            "gold_message_id": "msg_000380",
            "expected_message_id": "msg_000380",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "expense control",
            "expected_answer_summary": "Sneha asked to keep expenses in limit."
        },

        # === 12 PERSON-BASED QUERIES (Q17 - Q28) ===
        {
            "id": "Q17",
            "query_id": "Q17",
            "type": "person",
            "category": "person",
            "query": "What did Priya say about the trip budget?",
            "gold_message_id": "msg_000448",
            "expected_message_id": "msg_000448",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Priya expense quote",
            "expected_answer_summary": "Priya quoted 8500 per head."
        },
        {
            "id": "Q18",
            "query_id": "Q18",
            "type": "person",
            "category": "person",
            "query": "What did Rahul decide regarding travel?",
            "gold_message_id": "msg_000450",
            "expected_message_id": "msg_000450",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Rahul bus confirmation",
            "expected_answer_summary": "Rahul confirmed Saturday Volvo bus."
        },
        {
            "id": "Q19",
            "query_id": "Q19",
            "type": "person",
            "category": "person",
            "query": "What was Sneha suggesting about expenses?",
            "gold_message_id": "msg_000380",
            "expected_message_id": "msg_000380",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Sneha expense limit",
            "expected_answer_summary": "Sneha requested keeping expenses within pocket money limits."
        },
        {
            "id": "Q20",
            "query_id": "Q20",
            "type": "person",
            "category": "person",
            "query": "What did Abhishek say about the hackathon idea?",
            "gold_message_id": "msg_001250",
            "expected_message_id": "msg_001250",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Abhishek project decision",
            "expected_answer_summary": "Abhishek locked AI search engine."
        },
        {
            "id": "Q21",
            "query_id": "Q21",
            "type": "person",
            "category": "person",
            "query": "Did Arjun mention anything about payment?",
            "gold_message_id": "msg_002100",
            "expected_message_id": "msg_002100",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Arjun payment swiping",
            "expected_answer_summary": "Arjun offered card swipe for GPay reimbursement."
        },
        {
            "id": "Q22",
            "query_id": "Q22",
            "type": "person",
            "category": "person",
            "query": "What did Karan say about where to meet?",
            "gold_message_id": "msg_001180",
            "expected_message_id": "msg_001180",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Karan meeting location",
            "expected_answer_summary": "Karan specified CP metro gate 2."
        },
        {
            "id": "Q23",
            "query_id": "Q23",
            "type": "person",
            "category": "person",
            "query": "What did Arjun say about code submission?",
            "gold_message_id": "msg_001242",
            "expected_message_id": "msg_001242",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Arjun code deadline",
            "expected_answer_summary": "Arjun announced Sunday night deadline."
        },
        {
            "id": "Q24",
            "query_id": "Q24",
            "type": "person",
            "category": "person",
            "query": "What did Rahul say about room booking?",
            "gold_message_id": "msg_000442",
            "expected_message_id": "msg_000442",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Rahul hotel booking",
            "expected_answer_summary": "Rahul stated room booking is his department."
        },
        {
            "id": "Q25",
            "query_id": "Q25",
            "type": "person",
            "category": "person",
            "query": "What did Priya calculate for our group expense?",
            "gold_message_id": "msg_000448",
            "expected_message_id": "msg_000448",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Priya calculation",
            "expected_answer_summary": "Priya calculated 8500 per head."
        },
        {
            "id": "Q26",
            "query_id": "Q26",
            "type": "person",
            "category": "person",
            "query": "What hackathon proposal did Abhishek lock?",
            "gold_message_id": "msg_001250",
            "expected_message_id": "msg_001250",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Abhishek proposal lock",
            "expected_answer_summary": "Abhishek locked AI search engine proposal."
        },
        {
            "id": "Q27",
            "query_id": "Q27",
            "type": "person",
            "category": "person",
            "query": "What meeting point did Karan share?",
            "gold_message_id": "msg_001180",
            "expected_message_id": "msg_001180",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Karan meeting point",
            "expected_answer_summary": "Karan shared CP metro gate 2."
        },
        {
            "id": "Q28",
            "query_id": "Q28",
            "type": "person",
            "category": "person",
            "query": "What budget limit did Sneha mention?",
            "gold_message_id": "msg_000380",
            "expected_message_id": "msg_000380",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Sneha budget limit",
            "expected_answer_summary": "Sneha asked to keep expenses limited."
        },

        # === 12 TIME-BASED QUERIES (Q29 - Q40) ===
        {
            "id": "Q29",
            "query_id": "Q29",
            "type": "time",
            "category": "time",
            "query": "What did we discuss in January about the vacation?",
            "gold_message_id": "msg_000450",
            "expected_message_id": "msg_000450",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "January vacation decision",
            "expected_answer_summary": "January Volvo bus booking decision."
        },
        {
            "id": "Q30",
            "query_id": "Q30",
            "type": "time",
            "category": "time",
            "query": "What happened around mid February regarding project choices?",
            "gold_message_id": "msg_001250",
            "expected_message_id": "msg_001250",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "February project choice",
            "expected_answer_summary": "February AI search engine decision."
        },
        {
            "id": "Q31",
            "query_id": "Q31",
            "type": "time",
            "category": "time",
            "query": "Which decision did we make in March 2026?",
            "gold_message_id": "msg_002100",
            "expected_message_id": "msg_002100",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "March purchase decision",
            "expected_answer_summary": "March card swiping decision for equipment."
        },
        {
            "id": "Q32",
            "query_id": "Q32",
            "type": "time",
            "category": "time",
            "query": "What did Sneha mention back in January?",
            "gold_message_id": "msg_000380",
            "expected_message_id": "msg_000380",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Sneha January message",
            "expected_answer_summary": "Sneha January pocket money limitation."
        },
        {
            "id": "Q33",
            "query_id": "Q33",
            "type": "time",
            "category": "time",
            "query": "What did we talk about early in the chat archive?",
            "gold_message_id": "msg_000448",
            "expected_message_id": "msg_000448",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Early trip discussion",
            "expected_answer_summary": "Early calculation of 8500 per head."
        },
        {
            "id": "Q34",
            "query_id": "Q34",
            "type": "time",
            "category": "time",
            "query": "What meeting point was shared in February?",
            "gold_message_id": "msg_001180",
            "expected_message_id": "msg_001180",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "February meeting point",
            "expected_answer_summary": "February CP metro meeting point."
        },
        {
            "id": "Q35",
            "query_id": "Q35",
            "type": "time",
            "category": "time",
            "query": "What project deadline was announced in February?",
            "gold_message_id": "msg_001242",
            "expected_message_id": "msg_001242",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "February deadline announcement",
            "expected_answer_summary": "February announcement of Sunday Devpost push deadline."
        },
        {
            "id": "Q36",
            "query_id": "Q36",
            "type": "time",
            "category": "time",
            "query": "Which purchase was confirmed in March 2026?",
            "gold_message_id": "msg_002100",
            "expected_message_id": "msg_002100",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "March purchase confirmation",
            "expected_answer_summary": "March equipment purchase via GPay."
        },
        {
            "id": "Q37",
            "query_id": "Q37",
            "type": "time",
            "category": "time",
            "query": "What did Rahul book in January?",
            "gold_message_id": "msg_000450",
            "expected_message_id": "msg_000450",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "Rahul January booking",
            "expected_answer_summary": "Rahul booked Saturday Volvo bus in January."
        },
        {
            "id": "Q38",
            "query_id": "Q38",
            "type": "time",
            "category": "time",
            "query": "What expense calculation was shared in January?",
            "gold_message_id": "msg_000448",
            "expected_message_id": "msg_000448",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "January expense breakdown",
            "expected_answer_summary": "January expense breakdown of 8500 per head."
        },
        {
            "id": "Q39",
            "query_id": "Q39",
            "type": "time",
            "category": "time",
            "query": "What hackathon agreement happened in February?",
            "gold_message_id": "msg_001250",
            "expected_message_id": "msg_001250",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "February hackathon agreement",
            "expected_answer_summary": "February agreement on AI search engine."
        },
        {
            "id": "Q40",
            "query_id": "Q40",
            "type": "time",
            "category": "time",
            "query": "Where was the meet point fixed in February?",
            "gold_message_id": "msg_001180",
            "expected_message_id": "msg_001180",
            "hard": False,
            "zero_word_overlap": False,
            "expected_intent": "February meet point fix",
            "expected_answer_summary": "February meet point fix at CP metro gate 2."
        }
    ]

    # Verification of zero word overlap property
    print("\n==========================================")
    print("AUTOMATED ZERO-WORD-OVERLAP VERIFICATION:")
    print("==========================================")
    
    zero_overlap_count = 0
    for q in queries:
        if q.get("hard") or q.get("zero_word_overlap"):
            target_id = q["gold_message_id"]
            target_text = msg_map[target_id]
            q_words = normalize_text(q["query"])
            a_words = normalize_text(target_text)
            overlap = q_words.intersection(a_words)
            print(f"Query ID: {q['id']}")
            print(f"  Query:  '{q['query']}'")
            print(f"  Target: '{target_text}'")
            print(f"  Overlap count: {len(overlap)} (Words: {overlap})")
            if len(overlap) == 0:
                print("  STATUS: PASSED (STRICT 0 WORD OVERLAP) [OK]\n")
                zero_overlap_count += 1
            else:
                print("  STATUS: WARNING (Word overlap detected!) [FAIL]\n")

    assert len(queries) == 40, f"Expected 40 queries, got {len(queries)}"
    assert zero_overlap_count >= 8, f"Expected at least 8 zero-overlap queries, got {zero_overlap_count}"
    
    with open(QUERIES_FILE, "w", encoding="utf-8") as f:
        json.dump(queries, f, indent=2, ensure_ascii=False)

    with open(EVALUATION_QUERIES_FILE, "w", encoding="utf-8") as f:
        json.dump(queries, f, indent=2, ensure_ascii=False)
        
    print(f"Saved {len(queries)} benchmark queries to {QUERIES_FILE} and {EVALUATION_QUERIES_FILE}")

if __name__ == "__main__":
    msgs = generate_chat_corpus()
    generate_benchmark_queries(msgs)
