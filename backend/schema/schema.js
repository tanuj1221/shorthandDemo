
const schemas = {
  admindb: {
    adminid: 'int',
    password: 'varchar(255)'
  },
  audio_checking: {
    id: 'int unsigned',
    subjectId: 'int referenced {subjectsdb.subjectId}',
    passageCode: 'varchar(50)',
    answer: 'text',
    links: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  audiodb1: {
    subjectId: 'int referenced {subjectsdb.subjectId}',
    audio_name: 'text',
    links: 'text',
    length: 'varchar(20)',
    passageCode: 'varchar(50)',
    answer: 'text',
    ignore_words: 'text'
  },
  batch: {
    batch_year: 'varchar(50)',
    batchNo: 'varchar(20)',
    sem: 'varchar(10)',
    batchStartDate: 'date',
    batchEndDate: 'date'
  },
  coursesdb1: {
    coursed: 'int',
    courseName: 'text',
    TutorImagePath: 'text',
    TutorName: 'text',
    CourseDate: 'date',
    CourseThumbnailPath: 'text',
    VideoCount: 'int',
    CourseTitle: 'text'
  },
  expertdb: {
    id: 'int',
    password: 'varchar(255)',
    expertName: 'varchar(255)'
  },
  institute: {
    instituteId: 'int',
    instituteNo: 'varchar(50)',
    password: 'text',
    district: 'varchar(100)',
    active_student_count: 'int'
  },
  instituted: {
    instituteId: 'int',
    password: 'text',
    InstituteName: 'text',
    email: 'varchar(255)',
    mobile: 'varchar(20)',
    Address: 'text',
    district: 'varchar(100)',
    points: 'bigint'
  },
  mockdb: {
    subjectId: 'int referenced {subjectsdb.subjectId}',
    examid: 'varchar(50)',
    passagecode1: 'varchar(50)',
    passagecode2: 'varchar(50)',
    name: 'text'
  },
  qrpay: {
    student_id: 'int referenced {student.student_id}',
    user: 'varchar(100)',
    mobile: 'varchar(20)',
    email: 'varchar(255)',
    utr: 'varchar(50)',
    date: 'datetime',
    amount: 'decimal(10,2)'
  },
  savedata: {
    student_id: 'int referenced {student.student_id}',
    answer: 'text',
    original: 'text',
    list: 'text',
    instituteId: 'int referenced {instituted.instituteId}',
    subjectId: 'int referenced {subjectsdb.subjectId}',
    created_at: 'timestamp'
  },
  student: {
    student_id: 'char(6)',
    password: 'varchar(255)',
    firstName: 'varchar(255)',
    lastName: 'varchar(255)',
    instituteId: 'int referenced {instituted.instituteId}',
    batchNo: 'varchar(50) referenced {batch.batchNo}',
    batchStartDate: 'date',
    batchEndDate: 'date',
    subjectsId: 'json',
    amount: 'tinyint(1)'
  },
  student12: {
    student_id: 'int',
    password: 'text',
    instituteId: 'int referenced {instituted.instituteId}',
    batchNo: 'varchar(20) referenced {batch.batchNo}',
    batchStartDate: 'date',
    batchEndDate: 'date',
    firstName: 'varchar(100)',
    lastName: 'varchar(100)',
    subjectsId: 'json',
    amount: 'tinyint(1)',
    coursed: 'json'
  },
  student13: {
    student_id: 'int',
    password: 'text',
    instituteId: 'int referenced {instituted.instituteId}',
    batchNo: 'varchar(20) referenced {batch.batchNo}',
    batchStartDate: 'date',
    batchEndDate: 'date',
    firstName: 'varchar(100)',
    lastName: 'varchar(100)',
    subjectsId: 'json',
    amount: 'tinyint(1)',
    coursed: 'json',
    loggedin: 'tinyint(1)',
    rem_time: 'time',
    done: 'tinyint(1)',
    sem: 'varchar(10)'
  },
  student14: {
    student_id: 'varchar(255)',
    password: 'text',
    instituteId: 'text referenced {instituted.instituteId}',
    batchNo: 'text referenced {batch.batchNo}',
    batchStartDate: 'text',
    batchEndDate: 'text',
    firstName: 'text',
    lastName: 'text',
    motherName: 'text',
    middleName: 'text',
    subjectsId: 'text',
    amount: 'text',
    coursed: 'text',
    batch_year: 'text',
    loggedin: 'text',
    rem_time: 'text',
    done: 'text',
    sem: 'text',
    image: 'text'
  },
  subjectsdb: {
    subjectId: 'int',
    coursed: 'int referenced {coursesdb1.coursed}',
    subject_name: 'text',
    subject_name_short: 'varchar(50)',
    Daily_Timer: 'time',
    Passage_Timer: 'time',
    Demo_Timer: 'time'
  },
  subjectsdb_new: {
    subjectId: 'int referenced {subjectsdb.subjectId}',
    audio_name: 'text',
    links: 'text',
    length: 'varchar(20)',
    passageCode: 'varchar(50)',
    answer: 'text',
    ignore_words: 'text'
  }
};

module.exports = schemas;
