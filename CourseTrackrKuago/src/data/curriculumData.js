export const curriculum = [
  {
    semester: "1st Year - 1st Semester",
    courses: [
      { id: 1, code: "Math 111a", title: "Calculus 1", units: 3, prereq: null },
      { id: 2, code: "Chem 101", title: "Chemistry for Engineers 1", units: 4, prereq: null },
      { id: 3, code: "CPE 111", title: "Computer Engineering as Discipline", units: 1, prereq: null },
      { id: 4, code: "CPE 112", title: "Programming Logic and Design", units: 2, prereq: null },
      { id: 5, code: "NSTP101", title: "ROTC/CWTS/LTS 1", units: 3, prereq: null },
      { id: 6, code: "MMW", title: "Mathematics in the Modern World", units: 3, prereq: null },
      { id: 7, code: "RPH", title: "Readings in Philippine History", units: 3, prereq: null },
      { id: 8, code: "UTS", title: "Understanding the Self", units: 3, prereq: null },
      { id: 9, code: "PATHFIT1", title: "Movement Competency Training", units: 2, prereq: null }
    ]
  },
  {
    semester: "1st Year - 2nd Semester",
    courses: [
      { id: 10, code: "CPE 121", title: "Object Oriented Programming", units: 2, prereq: "CPE 112" },
      { id: 11, code: "CPE 122", title: "Discrete Mathematics", units: 3, prereq: "Math 111a" },
      { id: 12, code: "CPE 123", title: "Introduction to Engineering", units: 1, prereq: "CPE 111" },
      { id: 13, code: "ES 404", title: "Material Science & Engineering", units: 3, prereq: "Chem 101" },
      { id: 14, code: "Math 121a", title: "Calculus 2", units: 3, prereq: "Math 111a" },
      { id: 15, code: "Phys 120", title: "Physics for Engineers", units: 4, prereq: "Math 111a" },
      { id: 16, code: "ES 208", title: "Engineering Data Analysis", units: 3, prereq: "Math 111a" },
      { id: 17, code: "TCW", title: "The Contemporary World", units: 3, prereq: null },
      { id: 18, code: "PATHFIT2", title: "Exercise-Based Fitness Activities", units: 2, prereq: "PATHFIT1" },
      { id: 19, code: "NSTP 102", title: "ROTC/CWTS/LTS 2", units: 3, prereq: "NSTP101" }
    ]
  },
  {
    semester: "2nd Year - 1st Semester",
    courses: [
      { id: 20, code: "CPE 211", title: "Data Structures and Algorithm Analysis", units: 2, prereq: "CPE 121" },
      { id: 21, code: "CPE 212", title: "Operating Systems", units: 3, prereq: "CPE 121", coreq: "CPE 211" },
      { id: 22, code: "SC 211", title: "CPE Special Course", units: 3, prereq: "CPE 121, CPE 123", coreq: "CPE 211" },
      { id: 23, code: "EE 213", title: "Fundamentals of Electrical Circuits", units: 4, prereq: "Phys 120, CPE 123" },
      { id: 24, code: "Math 221", title: "Differential Equations", units: 3, prereq: "Math 121a" },
      { id: 25, code: "ES 301", title: "Engineering Economics", units: 3, prereq: "2nd Year" },
      { id: 26, code: "PurCom", title: "Purposive Communication", units: 3, prereq: null },
      { id: 27, code: "ArtApp", title: "Art Appreciation", units: 3, prereq: null },
      { id: 28, code: "Rizal", title: "Life and Works of Rizal", units: 3, prereq: null },
      { id: 29, code: "PATHFIT3", title: "PATHFIT 3", units: 2, prereq: "PATHFIT2" }
    ]
  },
  {
    semester: "2nd Year - 2nd Semester",
    courses: [
      { id: 30, code: "CPE 221", title: "Software Design and Engineering", units: 4, prereq: "CPE 211" },
      { id: 31, code: "CPE 222", title: "Data and Digital Communications", units: 3, prereq: null, coreq: "ECE 224" },
      { id: 32, code: "CPE 223", title: "Numerical Methods", units: 3, prereq: "Math 221" },
      { id: 33, code: "ECE 224", title: "Fundamentals of Electronic Circuits", units: 4, prereq: "EE 213" },
      { id: 34, code: "ES 207", title: "Advanced Engineering Mathematics", units: 3, prereq: "Math 221" },
      { id: 35, code: "Ethc", title: "Ethics", units: 3, prereq: null },
      { id: 36, code: "EnviSci", title: "Environmental Science", units: 3, prereq: null },
      { id: 37, code: "ES 103", title: "Computer-Aided Drafting", units: 1, prereq: null },
      { id: 38, code: "PATHFIT4", title: "PATHFIT 4", units: 2, prereq: "PATHFIT3" }
    ]
  },
  {
    semester: "2nd Year - Summer",
    courses: [
      { id: 39, code: "CPE 231", title: "Feedback and Control Systems", units: 3, prereq: "ES 207, CPE 221" },
      { id: 40, code: "STS", title: "Science, Technology, and Society", units: 3, prereq: null }
    ]
  },
  {
    semester: "3rd Year - 1st Semester",
    courses: [
      { id: 41, code: "CPE 311", title: "Logic Circuit and Design", units: 4, prereq: "ECE 224" },
      { id: 42, code: "CPE 312", title: "Methods of Research", units: 2, prereq: "PurCom, ES 208", coreq: "CPE 311" },
      { id: 43, code: "CPE 313", title: "Computer Networks and Security", units: 4, prereq: "CPE 222" },
      { id: 44, code: "CPE 314", title: "Introduction to HDL", units: 1, prereq: "CPE 112, ECE 224" },
      { id: 45, code: "CPE 315", title: "Fundamentals of Mixed Signals and Sensors", units: 3, prereq: "ECE 224" },
      { id: 46, code: "CPE 316", title: "Computer Engineering Drafting and Design", units: 1, prereq: "ECE 224, ES 103" },
      { id: 47, code: "EC 311", title: "CPE Elective Course 1", units: 3, prereq: "3rd Year" },
      { id: 48, code: "TECH 101", title: "Technopreneurship", units: 3, prereq: "3rd Year" },
      { id: 49, code: "GnS", title: "Gender and Society", units: 3, prereq: null }
    ]
  },
  {
    semester: "3rd Year - 2nd Semester",
    courses: [
      { id: 50, code: "CPE 321", title: "Basic Occupational Health and Safety", units: 3, prereq: "3rd Year" },
      { id: 51, code: "CPE 323", title: "Microprocessor", units: 4, prereq: "CPE 311, CPE 314" },
      { id: 52, code: "CPE 324", title: "CPE Practice and Design 1", units: 1, prereq: "CPE 312", coreq: "CPE 323" },
      { id: 53, code: "CPE 325", title: "CPE Laws and Professional Practice", units: 2, prereq: "3rd Year" },
      { id: 54, code: "CPE 326", title: "Emerging Technologies in CPE", units: 3, prereq: "3rd Year" },
      { id: 55, code: "ES 302", title: "Engineering Management", units: 2, prereq: null },
      { id: 56, code: "PICPE", title: "Philippine Indigenous Communities", units: 3, prereq: null },
      { id: 57, code: "EC 231", title: "CPE Elective Course 2", units: 3, prereq: "EC 311" },
      { id: 58, code: "CPE 322", title: "Digital Signal Processing", units: 4, prereq: "ES 207, CPE 231" }
    ]
  },
  {
    semester: "4th Year - 1st Semester",
    courses: [
      { id: 59, code: "CPE 411", title: "Embedded Systems", units: 4, prereq: "CPE 323" },
      { id: 60, code: "CPE 412", title: "Computer Architecture and Organization", units: 4, prereq: "CPE 323" },
      { id: 61, code: "CPE 414", title: "CPE Practice and Design 2", units: 2, prereq: "CPE 324", coreq: "CPE 411, CPE 412" },
      { id: 62, code: "CPE 415", title: "Seminar and Fieldtrips", units: 1, prereq: "4th Year" },
      { id: 63, code: "EC 411", title: "CPE Elective Course 3", units: 3, prereq: "EC 231" }
    ]
  },
  {
    semester: "4th Year - 2nd Semester",
    courses: [
      { id: 64, code: "CPE 421", title: "On the Job Training", units: 3, prereq: "No Subjects Behind", coreq: null }
    ]
  }
];