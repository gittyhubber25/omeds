<script>
  function giveMedication(id) {
    const card = document.getElementById(id);
    card.classList.remove('pending');
    card.classList.add('given');
    card.querySelector('.status').textContent = 'GIVEN';
    const timestamp = new Date().toLocaleTimeString();
    card.querySelector('.time-given').textContent =
        'Administered: ' + timestamp;
  }
</script>

<script>
    function givePRN(id, hours) {
      const card = document.getElementById(id);
      const now = new Date();
      const availableAgain = new Date(
            now.getTime() +
            hours * 60 * 60 * 1000
        );
    updateMedication(
        id, 'NOT READY',
        now.toLocaleString(),
        availableAgain.toLocaleString()
    );
        const medicationData = {
            lastGiven: now.getTime(),
            availableAgain: availableAgain.getTime()
        };

        localStorage.setItem(
            id,
            JSON.stringify(medicationData)
        );

        card.classList.remove('ready');
        card.classList.add('not-ready');

        card.querySelector('.status').textContent = 'NOT READY';

        card.querySelector('.last-given').textContent =
            'Last Given: ' + now.toLocaleTimeString();

        card.querySelector('.available-again').textContent =
            'Available Again: ' +
            availableAgain.toLocaleTimeString();
    }
</script>

<script>
    function clearPRNHistory() {
        localStorage.clear();
        location.reload();
    }
</script>

<script>
window.addEventListener('load', restorePRNs);

function restorePRNs() {

    const prnCards = document.querySelectorAll('[id^="prn"]');

    prnCards.forEach(function(card) {

        const storedData =
            localStorage.getItem(card.id);

        if (!storedData) return;
        

        const data = JSON.parse(storedData);

        const now = Date.now();

        const lastGiven =
            new Date(data.lastGiven);

        const availableAgain =
            new Date(data.availableAgain);

        card.querySelector('.last-given').textContent =
            'Last Given: ' +
            lastGiven.toLocaleTimeString();

        card.querySelector('.available-again').textContent =
            'Available Again: ' +
            availableAgain.toLocaleTimeString();

    if (now < data.availableAgain) {

        card.classList.remove('ready');
        card.classList.add('not-ready');

        card.querySelector('.status').textContent =
            'NOT READY';

        const timeRemaining =
            data.availableAgain - now;

        setTimeout(function() {

            card.classList.remove('not-ready');
            card.classList.add('ready');

            card.querySelector('.status').textContent =
                'READY';

            card.querySelector('.available-again').textContent =
                'Available Again: Ready Now';

        }, timeRemaining);

    } else {

        card.classList.remove('not-ready');
        card.classList.add('ready');

        card.querySelector('.status').textContent =
            'READY';

        card.querySelector('.available-again').textContent =
            'Available Again: Ready Now';
    }

    });

}
</script>

<script>
    async function loadMeds() {

    const response =
        await fetch(
            'https://script.google.com/macros/s/AKfycbxtugFHePScrkam3b1hdeu869zrbiLGqpS9aGLM0klgD_CYZMPrCJXyhnBnyZC5Rxv2/exec'
        );

    const data =
        await response.json();

    console.log(data);

}

loadMeds();
</script>

<script>
    async function updateMedication(
    id,
    status,
    lastGiven,
    availableAgain
) {

    await fetch(
        'https://script.google.com/macros/s/AKfycbxtugFHePScrkam3b1hdeu869zrbiLGqpS9aGLM0klgD_CYZMPrCJXyhnBnyZC5Rxv2/exec',
        {
            method: 'POST',

            body: JSON.stringify({

                id: id,

                status: status,

                lastGiven: lastGiven,

                availableAgain: availableAgain

            })

        }
    );

}
</script>
<script>
    setInterval(loadMeds, 5000);
</script>
