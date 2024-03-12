from dotenv import load_dotenv
from flask import Flask
from flask import request
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field

config = load_dotenv(override=True)

model = ChatOpenAI(model="gpt-4", temperature=0)

class RestrictionCheck(BaseModel):
    restriction: str = Field(description="Restriction alert of paper")
    status: str = Field(description="If there is no alert, it is 'ok'; if there is an alert, it is 'no'.")

# Sugeestion
class HeadingSuggestion(BaseModel):
    suggestion: str = Field(description="suggeston to improve the title")
    improvedHeading: str = Field(description="Improved title by the suggestion")
    
class SectionSuggestions(BaseModel):
    suggestion: str = Field(description="This is suggestion to improve the text")
    improvedText: str = Field(description="This is improved text by the suggestion")
    alert: str = Field(description="This is the best serious alert of this section")
    aiContentRate: float = Field(description="Percentage of content identified as AI-generated.")

restriction_parser = JsonOutputParser(pydantic_object=RestrictionCheck)
heading_parser = JsonOutputParser(pydantic_object=HeadingSuggestion)
section_parser = JsonOutputParser(pydantic_object=SectionSuggestions)

restriction_prompt = PromptTemplate(
    template="""
    As a paper reviewer, you should check the following requirements and then provide an alert and status.
    This is content of the paper: {paper}
    This is the requirement of the paper
    1. Must comply with the required content sections. 
    Required content Sections: Summary, Introduction, Development, Conclusions
    2. Must be consistent and appropriate. 
    3. Content should be generated 50% or less by artificial intelligence. This is the content of the paper: 
    This is the type of alert
    1. Does not comply with the required content sections.
    2. Document is inconsistent or inappropriate. 
    3. Content has been generated 50% or more by artificial intelligence.
    {format_instructions}
    """,
    input_variables=["paper"],
    partial_variables={"format_instructions": restriction_parser.get_format_instructions()},
)

heading_prompt = PromptTemplate(
    template="""
    A specific section dedicated to the article's title, offering suggestions for making it concise and appealing.
    Recommend short and not so scientific titles to users.
    This is title: {heading}
    {format_instructions}
    """,
    input_variables=["title"],
    partial_variables={"format_instructions": heading_parser.get_format_instructions()},
)
section_prompt = PromptTemplate(
    template="""
    Given the following paragraphs from the {title} section of a paper, please provide specific suggestions for improvement.
    For each paragraph, identify and correct any spelling mistakes, grammar issues, and phrasing that could be enhanced.
    Additionally, highlight any logical inconsistencies and suggest how they might be resolved.
    Aim to improve clarity, conciseness, and overall impact of the text.
    This is content of {title}: {content}
    {format_instructions}
    """,
    input_variables=["title", "content"],
    partial_variables={"format_instructions": section_parser.get_format_instructions()},
)

restriction_chain = restriction_prompt | model | restriction_parser
heading_chain = heading_prompt | model | heading_parser
section_chain = section_prompt | model | section_parser

app = Flask(__name__)

@app.route('/')
def index():
    return 'index'

@app.route('/restrictionCheck', methods = ["POST"])
def restrictionCheck():
    try:
        paper = request.args['paper']
        return restriction_chain.invoke({'paper': paper})
    except:
        return "error is detected"
    
@app.route('/paperCheck', methods = ["POST"])
def paperCheck():
    if request.method == "POST":
        return 'login'
    
@app.route('/headingCheck', methods = ["POST"])
def headingCheck():
    try:
        heading = request.args['heading']
        return heading_chain.invoke({"heading": heading})
    except:
        return "error is detected"

@app.route('/sectionCheck', methods = ["POST"])
def sectionCheck():
    try:
        title = request.args['title']
        content = request.args["content"]
        return section_chain.invoke({"title": title, "content": content})
    except:
        return "error is detected"
    
    
if __name__ == "__main__":
    app.run(debug=True, port=5000, host=('0.0.0.0'))