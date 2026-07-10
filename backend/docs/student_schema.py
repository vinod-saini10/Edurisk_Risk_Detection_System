from apiflask import Schema
from apiflask.fields import String



class StudentProfileSchema(Schema):
    name = String()
    email = String()
    course = String()
    semester = String()
    image_url = String()



class StudentUpdateSchema(Schema):
    name = String(required=True)
    email = String(required=True)
    course = String(required=False, load_default="")
    semester = String(required=False, load_default="")
    image_url = String(required=False, load_default="")