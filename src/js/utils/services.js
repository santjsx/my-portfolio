import gsap from "gsap";

// Helper to measure accurate DOM dimensions for physics bodies
function getTagDimensions(label) {
  const tempDiv = document.createElement("div");
  tempDiv.className = "tag";
  tempDiv.textContent = label;
  document.body.appendChild(tempDiv);
  const dimensions = { width: tempDiv.offsetWidth, height: tempDiv.offsetHeight };
  document.body.removeChild(tempDiv);
  return dimensions;
}

export function initServices() {
  const services = document.querySelectorAll(".service");
  if (!services.length) return;

  const { Engine, World, Bodies, Body } = window.Matter;

  services.forEach((service) => {
    const images = service.querySelectorAll(".image");
    const title = service.querySelector("h1");
    const tagLabels = service.getAttribute("data-tags").split(",");
    const tagSizes = tagLabels.map(label => getTagDimensions(label));

    let engine, tagElements = [], tagBodies = [], rafId, tagsContainer;
    let isHovered = false;
    let tagDropTimer;

    function createTags() {
      tagsContainer = document.createElement("div");
      tagsContainer.className = "tags-container";
      service.appendChild(tagsContainer);
      
      engine = Engine.create();

      tagLabels.forEach((label, index) => {
        // Create DOM element
        const tagEl = document.createElement("div");
        tagEl.className = "tag";
        tagEl.textContent = label;
        tagsContainer.appendChild(tagEl);

        const { width, height } = tagSizes[index];

        // Spawn slightly above the container with randomness
        const xPos = service.offsetWidth / 2 + (Math.random() * 60 - 30);
        const yPos = -50 - (index * 20); 
        const rotation = (Math.random() * 0.4) - 0.2;

        // Create Matter.js body matching the DOM capsule shape
        const body = Bodies.rectangle(xPos, yPos, width, height, {
          chamfer: { radius: height / 2 },
          restitution: 0.5,
          friction: 0.1,
          density: 0.001
        });

        Body.setAngle(body, rotation);
        World.add(engine.world, body);

        // Stagger fade-in
        gsap.to(tagEl, { opacity: 1, delay: index * 0.1 });

        tagElements.push(tagEl);
        tagBodies.push(body);
      });

      updateLoop();
    }

    // Continuously sync DOM to Physics Engine
    function updateLoop() {
      Engine.update(engine);
      tagElements.forEach((el, i) => {
        const body = tagBodies[i];
        // Sync position and rotation
        el.style.transform = `translate(${body.position.x - el.offsetWidth/2}px, ${body.position.y - el.offsetHeight/2}px) rotate(${body.angle}rad)`;
      });
      rafId = requestAnimationFrame(updateLoop);
    }

    function cleanup() {
      if (rafId) cancelAnimationFrame(rafId);
      if (engine) {
          World.clear(engine.world);
          Engine.clear(engine);
      }
      if (tagsContainer) tagsContainer.remove();
      tagElements = [];
      tagBodies = [];
    }

    // Hover Interaction Logic
    service.addEventListener("mouseenter", () => {
      isHovered = true;
      gsap.killTweensOf([service, images, title]);

      // Expand Layout & Animate elements
      gsap.to(service, { height: 400, ease: "elastic.out(1, 0.5)" });
      gsap.to(title, { color: "#eeeeee" });
      
      // Animate images rising into view with stagger
      gsap.to(images, { 
        y: 10, 
        rotation: (i) => i === 0 ? -5 : i === 1 ? 5 : 0, 
        stagger: 0.1 
      });

      // Small delay before dropping tags
      tagDropTimer = setTimeout(() => {
        if (isHovered) createTags();
      }, 250);
    });

    // Leave Interaction Logic
    service.addEventListener("mouseleave", () => {
      isHovered = false;
      clearTimeout(tagDropTimer); // Cancel if leaving too quickly
      gsap.killTweensOf([service, images, title]);

      // Fade out tags before cleaning up
      if (tagElements.length > 0) {
        gsap.to(tagElements, { 
            opacity: 0, 
            duration: 0.2,
            onComplete: cleanup 
        });
      } else {
        cleanup();
      }

      // Reverse Animations
      gsap.to(title, { color: "#ff3333" });
      gsap.to(images, { y: 200, stagger: 0.05 });
      gsap.to(service, { height: 100, ease: "elastic.out(1, 0.5)" });
    });
  });
}
