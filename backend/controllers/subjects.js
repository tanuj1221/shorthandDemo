const connection = require('../config/db1');


exports.getSubjectIds = async (req,res) => {
    try{
     
        const sujectQuery = "SELECT * from subjectsDb"

        const subjctsids = await connection.query(sujectQuery)

        if (sujectQuery!== null) {
            res.json(subjctsids[0]);
        } else { 
            res.status(404).send("subject database not addded please add it")
        }
    } catch (err) {
        res.status(500).send(err)
    }
}


exports.getCourses = async (req,res) => {
    try{
        
        const courseQuery = "SELECT * from coursesDb1"
        console.log('etching course')

        const courses = await connection.query(courseQuery)

        if (courseQuery!== null) {
            res.json(courses[0]);
        } else { 
            res.status(404).send("subject database not addded please add it")
        }
    } catch (err) {
        res.status(500).send(err)
    }
}


exports.audiosFromId = async (req, res) => {
    try {
        // Extract subjectId from the request body
        const { subjectId } = req.body;
        const userId = req.session.studentId;

        console.log('=== FETCHING AUDIO LIST ===');
        console.log('SubjectId:', subjectId);
        console.log('UserId:', userId);
        console.log('Session:', req.session);

        // Check if subjectId and userId are provided
        if (!subjectId || !userId) {
            console.log('ERROR: Missing subjectId or userId');
            return res.status(400).send("No subject ID or user ID provided.");
        }

        // Prepare a parameterized query to fetch the student's payment status
        const paymentQuery = "SELECT amount FROM student14 WHERE student_id = ?";

        // Execute the query with the userId as a parameter
        console.log('Checking payment status for userId:', userId);
        const [paymentResult] = await connection.query(paymentQuery, [userId]);

        // Check if the payment status is found
        if (paymentResult.length > 0) {
            const { amount } = paymentResult[0];
            console.log('Payment status:', amount);

            // First, get the Passage_Timer from subjectsDb
            const timerQuery = 'SELECT Passage_Timer FROM subjectsDb WHERE subjectId = ?';
            console.log('Fetching timer from subjectsDb for subjectId:', subjectId);
            const [timerResult] = await connection.query(timerQuery, [subjectId]);
            
            let passageTimer = 300; // Default 5 minutes in seconds
            if (timerResult.length > 0 && timerResult[0].Passage_Timer) {
                passageTimer = timerResult[0].Passage_Timer * 60; // Convert minutes to seconds
                console.log(`Passage_Timer found: ${timerResult[0].Passage_Timer} minutes = ${passageTimer} seconds`);
            } else {
                console.log('No timer found in subjectsDb, using default:', passageTimer, 'seconds');
            }

            // Prepare a parameterized query to fetch audio records
            const audioQuery = "SELECT * FROM audiodb1 WHERE subjectId = ?";

            // Execute the query with the subjectId as a parameter
            console.log('Fetching audio records for subjectId:', subjectId);
            const audioRecords = await connection.query(audioQuery, [subjectId]);
            console.log('Audio records found:', audioRecords[0]?.length || 0);

            // Check if any audio records are found
            if (audioRecords[0] && audioRecords[0].length > 0) {
                // Add the timer to each audio record
                const audioWithTimer = audioRecords[0].map(audio => ({
                    ...audio,
                    length: passageTimer.toString() // Override with timer from subjectsDb
                }));

                // If the student has paid, send all audio records
                if (amount === 'paid') {
                    console.log('Returning all audio records (paid user):', audioWithTimer.length);
                    res.json(audioWithTimer);
                } else {
                    console.log('Returning first 2 audio records (unpaid user):', audioWithTimer.length);
                    res.json(audioWithTimer.slice(0, 2));
                }
            } else {
                console.log('No audio records found for subjectId:', subjectId);
                res.status(404).send("No audio records found for the provided subject ID.");
            }
        } else {
            res.status(404).send("No payment status found for the provided user ID.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};