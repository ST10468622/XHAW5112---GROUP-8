
function calculateFee() {
  const courseSelect = document.getElementById("course");
  const monthsInput = document.getElementById("months");
  const result = document.getElementById("result");

  const courseFee = parseInt(courseSelect.value);
  const months = parseInt(monthsInput.value);

  if (isNaN(months) || months <= 0) {
    result.textContent = "Please enter a valid duration (in months).";
    result.style.color = "red";
    return;
  }

  const total = courseFee * months;
  result.textContent = `💰 Total Cost for ${months} month(s): R${total.toFixed(2)}`;
  result.style.color = "#003366";
}


const contactForm = document.querySelector('form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you — your message has been received.');
    contactForm.reset();
  });
}

document.getElementById('calculateBtn').addEventListener('click', calculateTotalFees);
document.getElementById('registrationForm').addEventListener('submit', handleFormSubmission);

// Global array to store selected courses for invoice/consultant request
let selectedCoursesArray = [];

// Constants
const VAT_RATE = 0.15; // 15%

function getDiscountRate(courseCount) {
    if (courseCount === 1) {
        return 0; // One course – no discount
    } else if (courseCount === 2) {
        return 0.05; // Two courses – 5% discount
    } else if (courseCount === 3) {
        return 0.10; // Three courses – 10% discount
    } else if (courseCount > 3) {
        return 0.15; // More than three courses – 15% discount
    }
    return 0;
}

function calculateTotalFees() {
    const checkboxes = document.querySelectorAll('input[name="course"]:checked');
    let subtotal = 0;
    
    // Reset and populate the selectedCoursesArray
    selectedCoursesArray = [];

    checkboxes.forEach(checkbox => {
        const fee = parseFloat(checkbox.dataset.fee);
        subtotal += fee;
        selectedCoursesArray.push({
            name: checkbox.value,
            fee: fee
        });
    });

    const courseCount = selectedCoursesArray.length;
    const discountRate = getDiscountRate(courseCount);
    
    // Calculations
    const discountAmount = subtotal * discountRate;
    const discountedTotal = subtotal - discountAmount;
    const vatAmount = discountedTotal * VAT_RATE;
    const finalQuotedTotal = discountedTotal + vatAmount;

    // Display the results
    const outputDiv = document.getElementById('totalFeesOutput');
    
    if (courseCount === 0) {
        outputDiv.innerHTML = '<p>Please select at least one course.</p>';
        return;
    }

    outputDiv.innerHTML = `
        <p>Courses Selected: <strong>${courseCount}</strong></p>
        <p>Subtotal (Course Fees): R${subtotal.toFixed(2)}</p>
        <p>Discount Applied (${(discountRate * 100).toFixed(0)}%): -R${discountAmount.toFixed(2)}</p>
        <p>Subtotal After Discount: R${discountedTotal.toFixed(2)}</p>
        <p>VAT (15%): +R${vatAmount.toFixed(2)}</p>
        <p><strong>Quoted Total Fee (VAT Incl.): R${finalQuotedTotal.toFixed(2)}</strong></p>
        <p class="note">(Please note this is just a quote.)</p>
    `;
}

function handleFormSubmission(event) {
    event.preventDefault(); // Stop the default form submission

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    if (selectedCoursesArray.length === 0) {
        alert("Please select at least one course and click 'Calculate Total Fees' before requesting a consultant.");
        return;
    }

    // Output the data for the 'invoice' array (as specified in instructions)
    console.log("--- Consultant Contact Request ---");
    console.log("Contact Details:", { name, phone, email });
    console.log("Selected Courses for Invoice/Booking:", selectedCoursesArray);
    
    // Perform a final fee calculation for verification
    calculateTotalFees(); 
    
    const finalTotalElement = document.querySelector('#totalFeesOutput strong');
    const finalTotal = finalTotalElement ? finalTotalElement.textContent : 'N/A';
    
    console.log("Quoted Final Total Fee:", finalTotal);
    
    // In a real application, you would send this data to a server here.
    alert(`Thank you, ${name}! Your request for a consultant to contact you has been submitted. They will contact you via email (${email}) or phone (${phone}). The quoted fee is ${finalTotal}. Check the console for the array of selected courses.`);
}

