import moment from "moment";
import { useEffect, useState } from "react";
import { Button, Container, Form, ListGroup, Modal, Stack } from "react-bootstrap";

import LoadingOverlay from 'react-loading-overlay-ts';

const AppointmentFormUserList = ({ fname, mname, lname, id, onButtonClick }) => {
  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-center">
      <>
        {`${fname} ${mname} ${lname}`}
      </>
      <Button variant="danger" size="sm" onClick={onButtonClick}>Remove</Button>

    </ListGroup.Item>
  )
}

export const AppointmentFormModal = ({ id, show, title, eventRange, handleClose }) => {
  const [defaultValues, setDefaultValues] = useState({
    selectedStaffList: [],
    selectedStudentList: [],
    selectedScheduleType: "",
    appointmentTitle: "",
    appointmentContent: ""
  })

  const [staffList, setStaffList] = useState([])
  const [selectedStaffList, setSelectedStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  const [studentsList, setStudentsList] = useState([])
  const [selectedStudentsList, setSelectedStudentsList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  // const [isStudentSelectionEmpty, setIsStudentSelectionEmpty] = useState([]);

  const [scheduleTypes, setScheduleTypes] = useState([])
  const [scheduleRepeatTypes, setScheduleRepeatTypes] = useState([])

  const [isLoading, setIsLoading] = useState(true);

  const defaultLoadingText = "Getting appointment details... "
  const [loadingText, setLoadingText] = useState(defaultLoadingText)

  const [formData, setFormData] = useState({
    start: "",
    end: "",
    title: "",
    content: "",
    scheduletype: "",
    repeat: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    console.log(formData)

  };

  const fetchAll = async () => {

    Promise.all([
      fetch(`${global.server_backend_url}/backend/appointments/scheduletypes`)
        .then((response) => {
          if (response.ok) return response.json();
          else throw response;
        })
        .then((data) => {
          if (data != scheduleTypes)
            setScheduleTypes(data);
          return data;
        }),

      fetch(`${global.server_backend_url}/backend/appointments/schedulerepeattypes`)
        .then((response) => {
          if (response.ok) return response.json();
          else throw response;
        })
        .then((data) => {
          if (data != scheduleRepeatTypes)
            setScheduleRepeatTypes(data);
          return data;
        }),

      fetch(`${global.server_backend_url}/backend/appointments/students`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw response;
        })
        .then((data) => {
          if (data != studentsList)
            setStudentsList(data);
        }),

      fetch(`${global.server_backend_url}/backend/appointments/staff`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw response;
        })
        .then((data) => {
          if (data != staffList)
            setStaffList(data);
        })
    ]).then(responses => {
      console.log("done")
      setIsLoading(false)
    })


  }

  useEffect(() => {
    setIsLoading(true)
    fetchAll();
    // const intervalId = setInterval(() => {  //assign interval to a variable to clear it.
    //   fetchAll();
    // }, 5000)
    // return () => clearInterval(intervalId); //This is important
  }, [])

  useEffect(() => {
    console.log(`id: ${id}`)
    if (id) {
      fetch(`${global.server_backend_url}/backend/appointments/schedule/${id}`)
        .then((response) => {
          if (response.ok)
            return response.json(); else throw response;
        }).then((data) => {
          const students = data.Users
            .filter((user) => user.type === "Student")
          const staff = data.Users
            .filter((user) => user.type !== "Student" && user.type !== "Admin")

          setSelectedStudentsList(students);
          setSelectedStaffList(staff);

          setFormData({
            ...formData,
            title: data.title,
            content: data.desc,
            scheduletype: data.state,
            start: moment(data.fromDate).format('YYYY-MM-DDThh:mm'),
            end: moment(data.toDate).format('YYYY-MM-DDThh:mm'),
            repeat: data.repeat,

          });

        }).catch((err) => {
          console.log(err)
        })
      console.log(`test ${id}`)
    } else {
      setFormData({
        start: moment(eventRange.fromDate).format('YYYY-MM-DDThh:mm'),
        end: moment(eventRange.toDate).format('YYYY-MM-DDThh:mm')
      });
    }
  }, [id])

  ///https://stackoverflow.com/questions/62111525/how-i-add-an-object-to-an-existing-array-react 
  //https://stackoverflow.com/questions/45277306/check-if-item-exists-in-array-react
  const addStudentToSelection = () => {
    setSelectedStudentsList(prev => [...prev,
    ...studentsList.filter((student) => {
      return student.id == selectedStudent && selectedStudentsList.every(x => x.id !== selectedStudent)
    })
    ])
  }

  const addStaffToSelection = () => {
    setSelectedStaffList(prev => [...prev,
    ...staffList.filter((staff) => {
      return staff.id == selectedStaff && selectedStaffList.every(x => x.id !== selectedStaff)
    })
    ])
  }

  const addScheduleToDB = () => {
    const users = [...selectedStaffList.map((selectedStaff) => {
      return { id: selectedStaff.id }
    }), ...selectedStudentsList.map((selectedStudent) => {
      return { id: selectedStudent.id }
    })]
    const data = {
      title: formData.title,
      desc: formData.content,
      state: formData.scheduletype,
      fromDate: eventRange.fromDate,
      toDate: eventRange.toDate,
      repeat: formData.repeat,
      Users: {
        connect: users
      }
    }

    fetch(`${global.server_backend_url}/backend/appointments/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then((response) => {
      console.log(response)
      if (response.ok) {
        onModalClose();
        return response.json();
      } else throw response;

    }).catch((err) => {
      console.log(err)
    })
  }

  const modifyScheduleToDB = () => {
    const users = [...selectedStaffList.map((selectedStaff) => {
      return { id: selectedStaff.id }
    }), ...selectedStudentsList.map((selectedStudent) => {
      return { id: selectedStudent.id }
    })]
    const data = {
      title: formData.title,
      desc: formData.content,
      state: formData.scheduletype,
      fromDate: moment(formData.start).toISOString(),
      toDate: moment(formData.end).toISOString(),
      repeat: formData.repeat,
      Users: {
        set: users
      }
    }

    fetch(`${global.server_backend_url}/backend/appointments/schedule/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then((response) => {
      console.log(response)
      if (response.ok) {
        onModalClose();
        return response.json();
      } else throw response;

    }).catch((err) => {
      console.log(err)
    })
  }

  const onModalSubmit = () => {
    if (id) {
      modifyScheduleToDB();
    } else addScheduleToDB();
  }

  const onModalClose = () => {
    handleClose();
    setSelectedStaffList([])
    setSelectedStaff("")
    setSelectedStudentsList([])
    setIsLoading(true)
    setLoadingText(defaultLoadingText)

    setFormData({
      ...formData,
      title: "",
      content: "",
      scheduletype: "",
      start: "",
      end: "",
      repeat: ""
    });
  }

  const onModalOpen = () => {
    fetchAll();
  }

  const handleDelete = () => {
    if (id) {
      fetch(`${global.server_backend_url}/backend/appointments/schedule/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }).then((response) => {
        console.log(response)
        if (response.ok) {
          onModalClose();
          return response.json();
        } else throw response;

      }).catch((err) => {
        console.log(err)
      })
    }
  }

  return (
    <Modal
      show={show}
      onHide={onModalClose}
      onShow={onModalOpen}
      backdrop="static"
      keyboard={false}
      size="lg"
    >
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <LoadingOverlay active={isLoading} spinner text={loadingText}>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Students Involved</Form.Label>
              <Stack direction="horizontal" gap={3}>
                <Form.Select size="lg" onChange={(e) => {
                  setSelectedStudent(e.target.value)
                }}>
                  <option key='blankChoice' hidden value>Select students...</option>
                  {studentsList.map((student) => {
                    return <option key={student.id} value={student.id}>{`${student.fname} ${student.mname} ${student.lname}`}</option>
                  })}
                </Form.Select>
                <Button variant="primary" size="lg" onClick={addStudentToSelection}>Select</Button>
              </Stack>
              <Form.Text className="text-muted">
                These people will be notified when added.
              </Form.Text>
              <ListGroup>
                {selectedStudentsList.map((selectedStudent) => {
                  // return <ListGroup.Item className="d-flex justify-content-between"> <>
                  //   {`${selectedStudent.fname} ${selectedStudent.mname} ${selectedStudent.lname}`}
                  // </>
                  //   <Button variant="danger" size="sm">Remove</Button>

                  // </ListGroup.Item>
                  return <AppointmentFormUserList
                    fname={selectedStudent.fname}
                    mname={selectedStudent.mname}
                    lname={selectedStudent.lname}
                    onButtonClick={() => {
                      setSelectedStudentsList(
                        selectedStudentsList.filter((x) => {
                          return x.id !== selectedStudent.id
                        })
                      )
                    }} />
                })}
                {selectedStudentsList.length === 0 ?
                  <ListGroup.Item disabled>Selected students appear here...</ListGroup.Item> : <></>
                }
              </ListGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Staff Involved</Form.Label>
              <Stack direction="horizontal" gap={3}>
                <Form.Select size="lg" onChange={(e) => {
                  setSelectedStaff(e.target.value)
                  console.log("test")
                }}>
                  <option key='blankChoice' hidden value>Select staff...</option>
                  {staffList.map((staff) => {
                    return <option value={staff.id}>{`${staff.fname} ${staff.mname} ${staff.lname}`}</option>
                  })}
                </Form.Select>
                <Button variant="primary" size="lg" onClick={addStaffToSelection}>Select</Button>
              </Stack>
              <Form.Text className="text-muted">
                These people will be notified when added.
              </Form.Text>
              <ListGroup>
                {selectedStaffList.map((selectedStaff) => {
                  return <AppointmentFormUserList
                    fname={selectedStaff.fname}
                    mname={selectedStaff.mname}
                    lname={selectedStaff.lname}
                    onButtonClick={() => {
                      setSelectedStaffList(
                        selectedStaffList.filter((x) => {
                          return x.id !== selectedStaff.id
                        })
                      )
                    }} />
                })}
                {selectedStaffList.length === 0 ?
                  <ListGroup.Item disabled>Selected staff appear here...</ListGroup.Item> : <></>
                }
              </ListGroup>
            </Form.Group>

            <Form.Group>

              <Form.Label>Schedule Status</Form.Label>
              <div key='inline-radio' className="mb-3">
                {scheduleTypes.map((scheduleType) => (
                  <Form.Check
                    inline
                    name="scheduletype"
                    type="radio"
                    id={`inline-radio-${scheduleType}`}
                    label={scheduleType}
                    value={scheduleType}
                    onChange={handleChange}
                    checked={formData.scheduletype === scheduleType} />

                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Appointment Title</Form.Label>
              <Form.Control
                name="title"
                placeholder="Required"
                onChange={handleChange}
                value={formData.title} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Appointment Content</Form.Label>
              <Form.Control
                as={'textarea'}
                name="content"
                rows={5}
                placeholder="Can either be appointment details, etc..."
                onChange={handleChange}
                value={formData.content} />
            </Form.Group>

            <Form.Group className="hstack gap-3 mb-3" >
              <>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="start"
                  value={formData.start}
                  onChange={handleChange}
                  required
                />
              </>
              <>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="end"
                  value={formData.end}
                  onChange={handleChange}
                  required
                />
              </>
            </Form.Group>

            <Form.Group className="mb-3">

              <Form.Label className="me-4">Repeat</Form.Label>
              {scheduleRepeatTypes.map((scheduleRepeatType) => {
                return <Form.Check
                  inline
                  name="repeat"
                  type="radio"
                  id={`inline-radio-${scheduleRepeatType}`}
                  label={scheduleRepeatType}
                  value={scheduleRepeatType}
                  onChange={handleChange}
                  checked={formData.repeat === scheduleRepeatType} />

              })}
            </Form.Group>

            <Stack direction="horizontal" className="gap-3 justify-content-between">
              <div>
                <Button variant="secondary" onClick={onModalClose}>
                  Close
                </Button>{' '}
                <Button variant="primary" onClick={onModalSubmit}>
                  Submit
                </Button>{' '}
              </div>
              <Button variant="danger" className={`${id ? '' : 'invisible'}`} onClick={handleDelete}>
                Delete
              </Button>
            </Stack>

          </Form>
        </Modal.Body>
      </LoadingOverlay>
    </Modal>
  );
}
