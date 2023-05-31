import { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react"; // the AG Grid React Component
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Dialog } from "primereact/dialog";
import { nanoid } from "nanoid";
import "./App.css";
import { Button } from 'primereact/button';
import "primereact/resources/themes/lara-light-indigo/theme.css";     
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import { Panel } from 'primereact/panel';
import { Calendar } from 'primereact/calendar';
import { CalendarChangeEvent } from "primereact/calendar";
import { Dropdown } from 'primereact/dropdown';
import { DropdownChangeEvent } from "primereact/dropdown";
import { InputNumber } from 'primereact/inputnumber';
import { InputNumberChangeEvent } from "primereact/inputnumber";
import { Toast } from 'primereact/toast';
import { Image } from 'primereact/image';
import rewardsImage from './rewards-2023.png';

function App() {
  type MyEvent = {
    id: string;
    date: Date;
    name: string;
    points: number;
  };

  function Hello() {
    return <h1>Employee Wellness App</h1>;
  }

  function MyPoints({ events }: { events: MyEvent[] }) {
    const totalPoints = events.reduce((sum, event) => sum + event.points, 0);
    let currentLevel = 1;
    let nextLevel = 2;
    let pointsRemaining = 1500 - totalPoints;
    if (totalPoints >= 1500) {
      currentLevel = 2;
      nextLevel = 3;
      pointsRemaining = 2250 - totalPoints;
    }
    if (totalPoints >= 2250) {
      currentLevel = 3;
      nextLevel = 4;
      pointsRemaining = 3000 - totalPoints;
    }
    if (totalPoints >= 3000) currentLevel = 4;
    return (
      <div>
        <h2>Total Points: {totalPoints}</h2>
        <h2>Current Level: {currentLevel}</h2>
        {currentLevel !== 4 ? (
          <h2>
            {pointsRemaining} Points to Level {nextLevel}
          </h2>
        ) : (
          <h2>Max Level Reached. Congrats!</h2>
        )}
      </div>
    );
  }

  function Event({
    event,
    onDelete,
    onEdit,
  }: {
    event: MyEvent;
    onDelete: () => void;
    onEdit: () => void;
  }) {
    return (
      <div>
        <h1>{event.name}</h1>
        <p>Date: {event.date.toLocaleDateString()}</p>
        <p>Points: {event.points}</p>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    );
  }

  type EventsListProps = {
    events: MyEvent[];
  };

  const EventsList: React.FC<
    EventsListProps & {
      onDelete: (index: number) => void;
      setOpenEdit: (index: number) => void;
    }
  > = ({ events, onDelete, setOpenEdit }) => {
    return (
      <div>
        {events.map((event, index) => (
          <Event
            key={index}
            event={event}
            onDelete={() => onDelete(index)}
            onEdit={() => setOpenEdit(index)}
          />
        ))}
      </div>
    );
  };

  class EventType {
    name: string;
    goal: number;
    timesAchieved: number;

    constructor(name: string, goal: number, timesAchieved: number) {
      this.name = name;
      this.goal = goal;
      this.timesAchieved = timesAchieved;
    }
  }

  type CreateEventFormProps = {
    onEventCreate: (event: MyEvent) => void;
    eventTypes: EventType[];
    setEventTypes: (eventTypes: EventType[]) => void;
    selectedEventType: EventType | null;
    setSelectedEventType: (eventType: EventType | null) => void;
  };

  const CreateEventForm: React.FC<CreateEventFormProps> = ({
    onEventCreate,
    eventTypes,
    setEventTypes,
    selectedEventType,
    setSelectedEventType,
  }) => {
    const [name, setName] = useState("");
    const [date, setDate] = useState<Date | undefined>();
    const [points, setPoints] = useState(1);
    const toast = useRef(null);

    const handleNameChange = (e: DropdownChangeEvent) => {
      console.log(e);
      const selectedEventType = e.target.value;
      setSelectedEventType(selectedEventType);
      setName(selectedEventType?.name || ""); // Update the name state
      console.log(name);
    };

    // Use useEffect to update the name state when selectedEventType changes
    useEffect(() => {
      if (selectedEventType) {
        setName(selectedEventType.name || "");
      }
    }, [selectedEventType]);

    const handleDateChange = (e: CalendarChangeEvent) => {
      if (e.value instanceof Date){
        setDate(e.value);
      }
      
    };

    const handlePointsChange = (e: InputNumberChangeEvent) => {
      setPoints(e.value);
    };
    const showSuccess = () =>{
      toast.current.show({severity:'warn', summary: 'Warning', detail:'Goal already reached', life: 3000});
    }

    const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
      if (!date){return}
      const newEvent: MyEvent = {
        id: nanoid(),
        name,
        date: date,
        points: points,
      };

      console.log(newEvent);

      if (selectedEventType) {
        console.log("event type")
        console.log(selectedEventType);
        if (selectedEventType.timesAchieved >= selectedEventType.goal){
          console.log("goal reached");
        } else {
          const updatedEventType: EventType = {
            ...selectedEventType,
            timesAchieved: selectedEventType.timesAchieved + 1,
          };
  
          const updatedEventTypes: EventType[] = eventTypes.map((eventType) =>
            eventType === selectedEventType ? updatedEventType : eventType
          );
  
          setSelectedEventType(updatedEventType);
          setEventTypes(updatedEventTypes);
          onEventCreate(newEvent);
          setSelectedEventType(null);
        }
      }

        

      
      // Reset form fields
      setName("");
      setDate(undefined);
      setPoints(0);
      showSuccess();
    };

    return (
      <Panel header="Enter Event">
        <Dropdown value={selectedEventType} onChange={handleNameChange} options={eventTypes} optionLabel={"name"} placeholder={"Select an event type"}/>
        <Calendar value = {date} onChange={handleDateChange} selectionMode="single" showIcon required/>
        <InputNumber value ={points} placeholder="Points" onChange={handlePointsChange} showButtons min={0}/>
        <Toast ref={toast} />
        <Button onClick={handleSubmit} type="submit">
          Create Event
        </Button>
        <Image src={rewardsImage} zoomSrc={rewardsImage} alt="Image" width="80" height="60" preview />
      </Panel>
    );
  };

  type GoalProps = {
    selectedEventType: EventType | null;
  };

  const Goal: React.FC<GoalProps> = ({ selectedEventType }) => {
    if (!selectedEventType) {
      return null; // Render nothing if no event type is selected
    }

    return (
      <Panel header="Details">
        <h2>Goal: {selectedEventType.goal}</h2>
        <h2>Times Achieved: {selectedEventType.timesAchieved}</h2>
      </Panel>
    );
  };
  function updateEventInList(
    eventList: MyEvent[],
    updatedEvent: MyEvent
  ): MyEvent[] {
    return eventList.map((event) => {
      if (event.id === updatedEvent.id) {
        return updatedEvent;
      }
      return event;
    });
  }
  
  function EditEntry({
    initialEvent,
    eventTypes,
    eventList,
    onEdit,
    onDelete,
    onClose,
    setEventTypes,
    setSelectedEventType,
  }: {
    initialEvent: MyEvent | null;
    eventTypes: EventType[];
    eventList: MyEvent[];
    onEdit: (editedEvent: MyEvent) => void;
    onDelete: (event: MyEvent | null) => void;
    onClose: () => void;
    setEventTypes: React.Dispatch<React.SetStateAction<EventType[]>>;
    setSelectedEventType: (eventType: EventType | null) => void;
  }) {
    const [eventType, setEventType] = useState<string>(
      initialEvent?.name || ""
    );
    const [eventDate, setEventDate] = useState<Date | null>(
      initialEvent?.date || null
    );
    const [eventPoints, setEventPoints] = useState<number>(
      initialEvent?.points || 0
    );

    const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setEventType(e.target.value);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEventDate(new Date(e.target.value));
    };

    const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEventPoints(parseInt(e.target.value, 10));
    };
    const handleDelete = () => {
      // Call the onDelete method and pass the initialEvent
      onDelete(initialEvent);
      onClose();
      setSelectedEventType(null);
    };
    const handleEdit = () => {
      // Construct the updated event object with the edited values
      if(!initialEvent?.id || !eventDate){return}
      const editedEvent: MyEvent = {
        ...initialEvent,
        name: eventType,
        date: eventDate,
        points: eventPoints,
      };

      console.log(editedEvent);
      const prevEventType = eventTypes.find(
        (type) => type.name === initialEvent?.name
      );
      if (prevEventType) {
        const updatedPrevEventType = {
          ...prevEventType,
          timesAchieved: prevEventType.timesAchieved - 1,
        };
        setEventTypes((prevEventTypes) =>
          prevEventTypes.map((type) =>
            type.name === prevEventType.name ? updatedPrevEventType : type
          )
        );
      }
      const newEventType = eventTypes.find((type) => type.name === eventType);
      if (newEventType) {
        const updatedNewEventType = {
          ...newEventType,
          timesAchieved: newEventType.timesAchieved + 1,
        };
        setEventTypes((prevEventTypes) =>
          prevEventTypes.map((type) =>
            type.name === newEventType.name ? updatedNewEventType : type
          )
        );
      }
      // Handle the edit logic or pass the edited event to the parent component via props
      onEdit(editedEvent);
      onClose();
      setSelectedEventType(null);
    };

    return (
      <div>
        <h2>ID: {initialEvent?.id ?? "N/A"}</h2>
        <div>
          <label htmlFor="eventType">Event Type:</label>
          <select
            id="eventType"
            value={eventType}
            onChange={handleEventTypeChange}
            required
          >
            <option value="">Select an event type</option>
            {/* Render the event type options dynamically */}
            {eventTypes.map((type) => (
              <option key={type.name} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="eventDate">Date:</label>
          <input
            id="eventDate"
            type="date"
            value={eventDate?.toISOString().substr(0, 10) || ""}
            onChange={handleDateChange}
            required
          />
        </div>
        <div>
          <label htmlFor="eventPoints">Points:</label>
          <input
            id="eventPoints"
            type="number"
            value={eventPoints}
            onChange={handlePointsChange}
            required
          />  
        </div>
        <Button type="button" onClick={handleEdit}>
          Edit Event
        </Button>
        <Button type="button" onClick={handleDelete}>
          Delete Event
        </Button>
      </div>
    );
  }

  const [eventList, setEventList] = useState<MyEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([
    { name: "Get a Dental Exam", goal: 2, timesAchieved: 1 },
    { name: "Track Your Daily Water Intake", goal: 365, timesAchieved: 1 },
    { name: "Get 120 Minutes of Exercise", goal: 365, timesAchieved: 5 },
    {
      name: "Eat 2.5 cups of fruits and vegetables per day for the week",
      goal: 52,
      timesAchieved: 4,
    },
    { name: "Mental Habits", goal: 1, timesAchieved: 0 },
    // Add more event types as needed
  ]);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(
    null
  );
  const [openEdit, setOpenEdit] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<MyEvent | null>(null);
  const columnDefs = useMemo(
    () => [
      { field: "id", headerName: "ID" },
      { field: "name", headerName: "Name", sortable: true },
      { field: "date", headerName: "Date", sortable: true  },
      { field: "points", headerName: "Points", sortable: true  },
    ],
    []
  );
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
    }),
    []
  );

  // never changes, so we can use useMemo

  const handleEventCreate = (event: MyEvent) => {
    setEventList([...eventList, event]); //appends event to the end of the eventList array
  };

  const handleEdit = (editedEvent: MyEvent) => {
    const updatedEventList = updateEventInList(eventList, editedEvent);
    setEventList(updatedEventList);
  };

  const handleDelete = (deletedEvent: MyEvent | null) => {
    
    if (deletedEvent && deletedEvent.name && deletedEvent.name !== "") {
      const updatedEvents = eventList.filter(
        (event) => event.id !== deletedEvent.id
      );
      setEventList(updatedEvents);

      const eventTypeToUpdate = eventTypes.find(
        (eventType) => eventType.name === deletedEvent.name
      );
      if (eventTypeToUpdate && eventTypeToUpdate.timesAchieved > 0) {
        const updatedEventType = {
          ...eventTypeToUpdate,
          timesAchieved: eventTypeToUpdate.timesAchieved - 1,
        };

        const updatedEventTypes = eventTypes.map((eventType) =>
          eventType.name === deletedEvent.name ? updatedEventType : eventType
        );

        setEventTypes(updatedEventTypes);
        // Update the selectedEventType if it matches the deleted event type
        if (selectedEventType && selectedEventType.name === deletedEvent.name) {
          setSelectedEventType(null);
        }
      }
    }
  };
  useEffect(() => {
    console.log(eventList);
  }, [eventList]);
  return (
    <main>
      <Hello />
      <CreateEventForm
        onEventCreate={handleEventCreate}
        eventTypes={eventTypes}
        setEventTypes={setEventTypes}
        selectedEventType={selectedEventType}
        setSelectedEventType={setSelectedEventType}
      />
      <Goal selectedEventType={selectedEventType} />
      <Panel header="Current Total">
      <MyPoints events={eventList} />
      </Panel>

      {/* <EventsList
        events={eventList}
        onDelete={handleDelete}
        setOpenEdit={(eventIndex) => {
          setEventToEdit(eventList[eventIndex]);
          // console.log(eventList);
          setOpenEdit(true);
          // onsole.log(eventIndex);
          // console.log(eventToEdit);
        }}
      /> */}
      <div style={{ height: "300px" }}>
        <AgGridReact
          className="ag-theme-alpine"
          rowData={eventList}
          columnDefs={columnDefs}
          onCellDoubleClicked={(event) => {
            // Get the clicked row data
            const rowData = event.data;
            // Set the event to edit
            setEventToEdit(rowData||null);
            // Show the Dialog modal window
            setOpenEdit(true);
          }}
        ></AgGridReact>
      </div>
      <Dialog
        visible={openEdit}
        onHide={() => setOpenEdit(false)}
        header="Edit Entry"
      >
        <EditEntry
          initialEvent={eventToEdit}
          eventTypes={eventTypes}
          eventList={eventList}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setOpenEdit(false)}
          setEventTypes={setEventTypes}
          setSelectedEventType={setSelectedEventType}
        />
      </Dialog>
      
    </main>
  );
}

export default App;
