from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import ChatOllama
import datetime

llm = ChatOllama(
        model="llama3.2:latest",
        temperature=0.5
    )

<<<<<<< HEAD
=======
#get today's date in dd-mm-yyyy format


>>>>>>> 2a1f060 (init commit)

def get_response(unstructured_details: str) :
    today_date = datetime.datetime.now().strftime("%d-%m-%Y")
    
    template = """
    You are a helpful assistant that generates structured emails for day planning based on unstructured input provided by the user. The user will share unstructured details about their work, including the project names and tasks they have planned or completed.

    Your task is to:

    Extract the project names and the corresponding tasks exactly as mentioned in the unstructured input. 
    Do not modify or rephrase the project names.
    Rephase the tasks to be more structured and clear, but do not change the meaning or context of the tasks.

    Email to generate:
    Day plan email: Sent at the start of the day to inform the team about planned tasks.
    
        
    Important Instructions:
        Use only the below email format. Do not add, modify, or remove any section.
        Do not change the wording of project names or task descriptions.
        Replace <current date> with todays date in dd-mm-yyyy format.
        At the end, output only the final email text based on the input.
        Do not include any extra lines or spaces in the output.
        Use same project name in working update section as defined in project working on.
        Only provide me actual email content nothing else.

    Unstructured input: {unstructured_details}
    
    Generate a well-structured email using the following strict format only:
    Hi,
    Greeting of the day,
    This mail is regarding my daily status update.
    Date: {today_date}
    
    Project working on: 
    <list of project name only without any task details in the format:
        1. Project Name 1
        2. Project Name 2, ...>

    Availability:
        10.30am-2.30pm
        3.30pm - 8.00pm
    
    Working Update: 
    <list of tasks for each project name in the format: 
        1. Project Name - Task 1
        2. Project Name -  Task 2, ...>
    """

    prompt = ChatPromptTemplate.from_template(template)

    chain = (
    prompt
    | llm
    | StrOutputParser()
    )

    return chain.invoke({
    "unstructured_details": unstructured_details,
    'today_date': today_date
    })
<<<<<<< HEAD

def get_response_general(unstructured_details: str) :
    today_date = datetime.datetime.now().strftime("%d-%m-%Y")
    
    template = """
    You are an advanced language model capable of detecting the type of email required based on user input. Your task is to analyze the provided description and determine whether the email should be professional or casual. Once identified, compose a clear, concise, and on-point email that aligns with the identified tone. 

    Follow these steps:

    1. Read the user's description carefully.
    2. Identify key indicators that suggest the tone of the email (e.g., formality of language, context, and recipient's relationship).
    3. Determine if the email should be categorized as "professional" or "casual."
    4. Write the email accordingly, ensuring it is:
    - Clear: Use straightforward language and avoid jargon.
    - Concise: Keep the email brief and to the point, focusing on the main message.
    - Appropriate: Match the tone and style to the identified category (professional or casual).
    5. Only provide me actual email content nothing else.
    6. Do not include any extra lines or spaces in the output.
    7. if required, use the current date as {today_date} in the email. otherwise, do not include the date in the email. Use the date to make any calculations if required.
    8. structure of output should be like:
    Subject: <subject of the email>
    Body: <body of the email>


    For example, if the input is: "I need to invite my friend to a birthday party," the output should be a casual email. If the input is: "I need to request a meeting with my supervisor regarding project updates," the output should be a professional email.

    Begin by analyzing the following user input: {unstructured_details}
    """

    prompt = ChatPromptTemplate.from_template(template)

    chain = (
    prompt
    | llm
    | StrOutputParser()
    )

    return chain.invoke({
    "unstructured_details": unstructured_details,
    'today_date': today_date
    })
=======
>>>>>>> 2a1f060 (init commit)
