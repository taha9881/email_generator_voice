from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import ChatOllama
import datetime

llm = ChatOllama(
        model="llama3.2:latest",
        temperature=0.5
    )

#get today's date in dd-mm-yyyy format



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
