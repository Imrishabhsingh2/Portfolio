
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.work__tab');
  const workItems = document.querySelectorAll('.work-item');
  const softwareHighlight = document.querySelector('.software-highlight');

  // Function to filter items
  const filterWork = (filter) => {
    workItems.forEach(item => {
      const itemCategory = item.dataset.category;
      const shouldShow = filter === 'all' || itemCategory === filter;
      item.classList.toggle('is-hidden', !shouldShow);
    });

    // Special handling for software section
    if (filter === 'software') {
      softwareHighlight.style.display = 'block';
      // Hide all work-items when software is selected
      workItems.forEach(item => item.classList.add('is-hidden'));
    } else {
      softwareHighlight.style.display = 'none';
    }
  };

  // Event listeners for tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all tabs
      tabs.forEach(t => t.classList.remove('is-active'));
      // Activate clicked tab
      tab.classList.add('is-active');
      const filter = tab.dataset.filter;
      filterWork(filter);
    });
  });

  // Initial filter setup
  const initialFilter = document.querySelector('.work__tab.is-active')?.dataset.filter || 'social';
  filterWork(initialFilter);
});
