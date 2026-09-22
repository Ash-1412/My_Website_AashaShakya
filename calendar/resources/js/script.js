const event_modal = document.getElementById('event_modal');

const eventNameInput = document.getElementById('event_name');

if (event_modal && eventNameInput) {

    event_modal.addEventListener('shown.bs.modal', () => {

        eventNameInput.focus();

    });

}


// Form validation
const eventForm = document.getElementById('event_form');

if (eventForm) {

    eventForm.addEventListener('submit', (event) => {

        event.preventDefault();

        if (!eventForm.checkValidity()) {

            eventForm.classList.add('was-validated');

            return;
        }

        console.log("Event is valid!");

    });

}


// Modality
function updateLocationOptions(modality) {

    const locationWrapper = document.getElementById('location_wrapper');
    const locationInput = document.getElementById('event_location');

    const remoteUrlWrapper = document.getElementById('remote_url_wrapper');
    const remoteUrlInput = document.getElementById('event_remote_url');

    if (!locationWrapper || !locationInput ||
        !remoteUrlWrapper || !remoteUrlInput) {
        return;
    }

    if (modality === 'remote') {

        locationWrapper.classList.add('d-none');
        locationInput.required = false;

        remoteUrlWrapper.classList.remove('d-none');
        remoteUrlInput.required = true;

    } else {

        locationWrapper.classList.remove('d-none');
        locationInput.required = true;

        remoteUrlWrapper.classList.add('d-none');
        remoteUrlInput.required = false;

    }
}

function createEventCard(eventDetails, eventIndex) {
    const eventElement = document.createElement('div');

    let categoryClass = '';

    if (eventDetails.category === 'Academic') {
        categoryClass = 'category-academic';
    } else if (eventDetails.category === 'Work') {
        categoryClass = 'category-work';
    } else if (eventDetails.category === 'Personal') {
        categoryClass = 'category-personal';
    } else if (eventDetails.category === 'Social') {
        categoryClass = 'category-social';
    }

    eventElement.className =
        'event row border rounded m-1 py-1 ' + categoryClass;

    const eventContent = document.createElement('div');

    let locationInfo = '';

    if (eventDetails.modality === 'in-person') {
        locationInfo = `
            <strong>Location:</strong> ${eventDetails.location}<br>
        `;
    } else if (eventDetails.modality === 'remote') {
        locationInfo = `
            <strong>Remote URL:</strong> ${eventDetails.remote_url}<br>
        `;
    }

    eventContent.innerHTML = `
        <strong>${eventDetails.name}</strong><br>
        <strong>Day:</strong> ${eventDetails.weekday}<br>
        <strong>Time:</strong> ${eventDetails.time}<br>
        <strong>Modality:</strong> ${eventDetails.modality}<br>
        ${locationInfo}
        <strong>Attendees:</strong> ${eventDetails.attendees}<br>
        <strong>Category:</strong> ${eventDetails.category}

        <div class="mt-2">
            <button class="btn btn-sm btn-secondary"
                    onclick="editEvent(${eventIndex})">
                Edit
            </button>

            <button class="btn btn-sm btn-danger"
                    onclick="deleteEvent(${eventIndex})">
                Delete
            </button>
        </div>
    `;

    eventElement.appendChild(eventContent);

    return eventElement;
}

function addEventToCalendarUI(eventInfo, eventIndex) {
    const dayColumn = document.getElementById(
        eventInfo.weekday.toLowerCase()
    );

    const eventCard = createEventCard(eventInfo, eventIndex);

    dayColumn.appendChild(eventCard);
}
const events = [];
function saveEvent() {
    const eventForm = document.getElementById('event_form');

    // Validate the form
    if (!eventForm.checkValidity()) {
        eventForm.classList.add('was-validated');
        return;
    }

    // Read form values
    const name = document.getElementById('event_name').value;
    const weekday = document.getElementById('event_weekday').value;
    const time = document.getElementById('event_time').value;
    const modality = document.getElementById('event_modality').value;
    const location = document.getElementById('event_location').value;
    const remote_url = document.getElementById('event_remote_url').value;
    const attendees = document.getElementById('event_attendees').value;
    const category = document.getElementById('event_category').value;

    // Create event object
    const eventDetails = {
        name: name,
        weekday: weekday,
        time: time,
        modality: modality,
        location: modality === 'in-person' ? location : null,
        remote_url: modality === 'remote' ? remote_url : null,
        attendees: attendees,
        category: category
    };

    // Check if we are editing or creating a new event
    const editingIndex = eventForm.dataset.editingIndex;

    if (editingIndex !== undefined) {
        // Replace the existing event
        events[editingIndex] = eventDetails;

        // Remove editing mode
        delete eventForm.dataset.editingIndex;
    } else {
        // Add a new event
        events.push(eventDetails);
    }

    // Check the array in the console
    console.log(events);

    // Update the calendar
    refreshCalendar();

    // Reset the form
    eventForm.reset();
    eventForm.classList.remove('was-validated');

    // Reset location/remote fields
    updateLocationOptions('in-person');

    // Close the modal
    const modalElement = document.getElementById('event_modal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.hide();
}
function deleteEvent(eventIndex) {
    events.splice(eventIndex, 1);

    console.log(events);

    refreshCalendar();
}

function editEvent(eventIndex) {
    const eventDetails = events[eventIndex];

    document.getElementById('event_name').value = eventDetails.name;
    document.getElementById('event_weekday').value = eventDetails.weekday;
    document.getElementById('event_time').value = eventDetails.time;
    document.getElementById('event_modality').value = eventDetails.modality;
    document.getElementById('event_attendees').value = eventDetails.attendees;
    document.getElementById('event_category').value = eventDetails.category;

    if (eventDetails.modality === 'in-person') {
        document.getElementById('event_location').value =
            eventDetails.location;
    } else {
        document.getElementById('event_remote_url').value =
            eventDetails.remote_url;
    }

    updateLocationOptions(eventDetails.modality);

    // Remember which event we are editing
    eventForm.dataset.editingIndex = eventIndex;

    const modalElement = document.getElementById('event_modal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
}
function refreshCalendar() {
    const weekdays = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'
    ];

    // Remove existing event cards
    weekdays.forEach(function(day) {
        const dayColumn = document.getElementById(day);

        const eventCards = dayColumn.querySelectorAll('.event');

        eventCards.forEach(function(card) {
            card.remove();
        });
    });

    // Add events back to the calendar
    events.forEach(function(eventDetails, index) {
        addEventToCalendarUI(eventDetails, index);
    });
}