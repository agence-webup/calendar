## Démo

https://agence-webup.github.io/calendar/

## Installation


Ajout du CSS :

```html
<link rel="stylesheet" href="https://rawgit.com/agence-webup/calendar/master/dist/calendar.css">
```

Ajout du JS :
```html
<script src="https://rawgit.com/agence-webup/calendar/master/dist/calendar.js"></script>
```

## Initialisation

Création de la base :

```html
<div id="calendar"></div>
```

En ce qui concerne les contrôles, la base est libre, il suffit juste de bien spécifier les ID et de les passer dans options.ui :

```html
<button id="prev"><</button>
<button id="today">today</button>
<button id="next">></button>
```

Instanciation du calendrier :

```javascript
let calendar = new Calendar("#calendar", {
    currentDay: new Date(),
    numberOfDays: 3,
    columnsPerDay: 3,
    dayStartHour: '08:00',
    dayEndHour: '18:00',
    slotDuration: 20,
    cssClass: 'calendar',
    ui: {
        next: document.querySelector('#next'),
        prev: document.querySelector('#prev'),
        today: document.querySelector('#today'),
    },
    isCellBlocked: function(timestamp) {
        // block cells with condition
        return Date.now() > timestamp;
    },
    isCellSplited: function(timestamp) {
        return splitedSlots.includes(timestamp);
    },
    onEventClicked: function(eventId) {
        alert('Event clicked: ' + eventId);
    },
    onLocked: function(start, end, callback) {
        console.log(start + '->' + end);
        setTimeout(() => {
            // commit event
            callback(null, {
                start: new Date(2017, 6, 11, 12, 0, 0, 0),
                end: new Date(2017, 6, 11, 14, 0, 0, 0),
                column: 1,
            });
        }, 1000);
    },
    onPeriodChange: function(start, end) {
        console.log(this);
        console.log(start + ' ->', end);
        this.loadEvents(events, blockedEvents);
    }
});
```
## Callback

| méthode  | explication |
|---|---|
| onEventClicked  | Appelé lors du clic sur un évènement. Renvoi l'identifiant de l'évènement  |
| onLocked  | Appelé lors du blocage d'une plage horaire. Renvoi le début et la fin de la plage, ainsi qu'un callback devant être utilisé pour confirmer l'ajout de la plage après le traitement côté serveur |
| onPeriodChange | Appelé lors d'un changement de période avec les boutons suivant, précédent et aujourd'hui. Renvoi le début et la fin de la nouvelle période. __Important:__ il est nécessaire de penser à recharger les évènements liés à cette nouvelle période en utilisant la méthode loadEvents  |

## Modes

### Ajouter une nouvelle tâche

```javascript
calendar.startAddEventMode(60, (timestamp, column) => {
    alert('Drop on column ' + column + ' at ' + timestamp);
});
```

### Editer une tâche

```javascript
calendar.startEditMode(1, (timestamp, column) => {
  alert('Drop on column ' + column + ' at ' + timestamp);
});
```

### Bloquer des plages horaire
```javascript
calendar.startLockedMode();
```

### Supprimer un événement
```javascript
# remove event with id 1
calendar.removeEvent(1);
```
