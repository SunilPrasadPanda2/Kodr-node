1. now a user cant not be a trainer and a student at a time if he is creating different accounts for trainer and student 
with same email and mobile 
    -> it will create problem while signUp with same email and mobile and password
    -> if he used different mobile with same email and password then it will created problem while 
        login either for trainer or student

2. now in the same system at the same time we can not login for admin,student,trainer 
because in REACT we are storing our login user data in the localhost and localhost is same for all the user of a system.
    -> to tovercome from this we need to store our login user data in the cookies because cookies are different for 
        different different webpage
    