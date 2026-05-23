import React from 'react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'


// ────About Page────────────────────────────────────
// Static page containing two "about" sections,
// one for HKIF and one for the Development team.
// Displays cards of all the team members with
// their focus areas and their Github links.
// ──────────────────────────────────────────────────

const teamMembers = [
  {
    name: 'Juri',
    role: 'Backend',
    github: "https://github.com/JuriRappold",
    focus: [
      'Database Design',
      'Backend Input Validation',
      'CRUD Endpoints',
      'Database Result Formatting',
    ],
  },
  {
    name: 'Gunnar',
    role: 'Backend',
    github: 'https://github.com/gunnarwrld',
    focus: [
      'Authentication',
      'Backend Deployment',
      'API Infrastructure',
      'Type System & Architecture',
    ],
  },
  {
    name: 'Jasmine',
    role: 'Fullstack',
    github: 'https://github.com/jasminerezai',
    focus: [
      'Project Management & Scrum',
      'Backend Scheduling Infrastructure',
      'Participation Endpoints',
      'CRON-based Automation',
      'API Architecture and Development',
      'Frontend Implementation & Deployment',
    ],
  },
  {
    name: 'Lawrence',
    role: 'Frontend',
    github: 'https://github.com/larrymijo',
    focus: [
      'Filter Mechanism',
      'Error Handling',
      'Loading States',
      'Participation Features',
      'Login/Register Feature'
    ],
  },
  {
    name: 'Isabelle',
    role: 'Frontend',
    github: 'https://github.com/isaqelle',
    focus: [
      'Schedule Page',
      'Activities Page',
      'About Page',
      'Leader Profile Dashboard',
      'Admin Management Features',
    ],
  },
]

export default function AboutPage() {
  return (

    <div
      style={{
        padding: 'var(--space-6)',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >

      {/* ──────── Hero Section ──────────────────────────────── */}

      {/* ── About HKIF ───────────────────────────── */}
      <Card
        padding="lg"
        shadow="sm"
        style={{
          marginBottom: 'var(--space-6)',
        }}
      >

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >

          <div>

            <h2
              style={{
                fontSize: '2.5rem',
                marginBottom: 'var(--space-6)',
              }}
            >
              About HKIF
            </h2>

            <p
              style={{
                color: 'var(--color-text-muted)',
                lineHeight: 1.7,
                marginBottom: 'var(--space-6)',
              }}
            >
              Högskolan Kristianstad IF (HKIF) is a student sports association
              focused on creating an active and social community for students.
              HKIF organizes activities, events, and training opportunities
              that encourage participation, teamwork, and student engagement.
            </p>

            <p
              style={{
                color: 'var(--color-text-muted)',
                lineHeight: 1.7,
              }}
            >
              This website was developed to simplify activity scheduling,
              participation management, and communication between leaders
              and attendees. The platform provides a modern and responsive
              experience for both organizers and members.
            </p>

          </div>

          <div
            style={{
              display: 'flex',
              gap: 'var(--space-6)',
              flexWrap: 'wrap',
            }}
          >

            <Badge>
              Student Association
            </Badge>

            <Badge>
              Sports & Activities
            </Badge>

            <Badge>
              Community-Focused
            </Badge>

          </div>

          <div
            style={{
              display: 'flex',
              gap: 'var(--space-6)',
              flexWrap: 'wrap',
              marginTop: 'var(--space-6)',
            }}
          >

          {/* ── Email & Social media links ─────────────────── */}

            <a
              href="mailto:hkif@hotmail.se"
              style={{ textDecoration: 'none' }}
            >
              <Button variant="outline" size="sm">
                Email
              </Button>
            </a>

            <a
              href="https://www.facebook.com/HKIFatHKR/"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button variant="outline" size="sm">
                Facebook →
              </Button>
            </a>

            <a
              href="https://www.instagram.com/hkif_skane/"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button variant="outline" size="sm">
                Instagram →
              </Button>
            </a>

          </div>

        </div>

      </Card>

      {/* ── About HKIF Development team ───────────────────────────── */}
      <Card
        padding="lg"
        shadow="md"
        style={{
          marginBottom: 'var(--space-6)',
          background: 'var(--color-primary-light)',
          border: '1px solid var(--color-border)',
        }}
      >

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}
        >

          <div>
            <h1
              style={{
                fontSize: '1.8rem',
                marginBottom: 'var(--space-6)',
              }}
            >
              HKIF-Website Development Team
            </h1>

            <p
              style={{
                color: 'var(--color-text-muted)',
                maxWidth: '700px',
                lineHeight: 1.6,
              }}
            >
              Meet the team behind the HKIF activity management platform.
              This project was built collaboratively using agile workflows,
              fullstack development practices, continuous testing,
              and coordinated code reviews.
            </p>
          </div>

          <div
            style={{
              marginTop: 'var(--space-6)',
            }}
          >
            <a
              href="https://github.com/jasminerezai/hkif-web"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: 'none',
              }}
            >
              <Button
                variant="primary"
                size="sm"
              >
                View Project Repository →
              </Button>
            </a>
          </div>

        </div>

      </Card>

      {/* ── Team Section ───────────────────────────── */}
      <div style={{ marginBottom: 'var(--space-6)' }}>

        <h2
          style={{
            marginBottom: 'var(--space-6)',
            fontSize: '1.5rem',
          }}
        >
          Team Members
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >

          {teamMembers.map(member => (

            <Card
              key={member.name}
              padding="lg"
              shadow="sm"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease',
              }}
            >

              <div>

                {/* ────── Team Members Header ─────────── */}
                <div
                  style={{
                    marginBottom: 'var(--space-6)',
                  }}
                >

                  <h3
                    style={{
                      fontSize: '1.4rem',
                      marginBottom: 'var(--space-5)',
                    }}
                  >
                    {member.name}
                  </h3>

                  <Badge>
                    {member.role}
                  </Badge>

                </div>

                {/* ────── Focus Areas ─────────── */}
                <div>

                  <h4
                    style={{
                      marginBottom: 'var(--space-5)',
                      fontSize: '0.95rem',
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Focus Areas
                  </h4>

                  <ul
                    style={{
                      paddingLeft: '18px',
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >

                    {member.focus.map(item => (
                      <li
                        key={item}
                        style={{
                          color: 'var(--color-text)',
                          lineHeight: 1.5,
                        }}
                      >
                        {item}
                      </li>
                    ))}

                  </ul>

                </div>

              </div>

              {/* ────── Github-link Button ─────────── */}
              <div
                style={{
                  marginTop: 'var(--space-6)',
                }}
              >
                <a
                  href={member.github}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: 'none',
                  }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    View GitHub →
                  </Button>
                </a>
              </div>

            </Card>

          ))}

        </div>

      </div>

    </div>
  )
}