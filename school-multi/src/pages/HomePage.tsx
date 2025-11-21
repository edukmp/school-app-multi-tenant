import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTenant } from '../contexts/TenantContext'
import LoginActions from '../components/auth/LoginActions'

const HomePage: React.FC = () => {
  const { user } = useAuth()
  const { tenant } = useTenant()

  const displayName = user?.user_metadata?.full_name || user?.email || 'Karla'

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Greetings, {displayName}!</h1>
          <p className="dashboard__subtitle">
            {tenant?.name || 'Your School'} • 7 May, 2023
          </p>
        </div>
        <div className="dashboard__user">
          <div className="dashboard__user-info">
            <span className="dashboard__user-name">{displayName}</span>
            <span className="dashboard__user-role">
              {user ? 'Parent Portal' : 'Guest'}
            </span>
          </div>
          <div className="dashboard__avatar" />
        </div>
      </header>

      {!user && (
        <div className="dashboard__login-banner">
          <p>Login untuk mengakses dashboard lengkap orang tua.</p>
          <div className="dashboard__login-actions">
            <LoginActions />
          </div>
        </div>
      )}

      <div className="dashboard__grid">
        {/* Left: main content */}
        <section className="dashboard__main">
          {/* Stats cards */}
          <div className="dashboard__stats-row">
            <div className="stat-card">
              <div className="stat-card__label">Total classes</div>
              <div className="stat-card__value">02/08</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Total students</div>
              <div className="stat-card__value">02/08</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Total lessons</div>
              <div className="stat-card__value">40/50</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Total hours</div>
              <div className="stat-card__value">12/20</div>
            </div>
          </div>

          {/* Middle row: performance + attendance */}
          <div className="dashboard__middle-row">
            <div className="card card--stretch">
              <div className="card__header">
                <h2>Students Performance</h2>
                <span className="badge">Class A</span>
              </div>
              <ul className="students-list">
                {[
                  { name: 'Oliver James', grade: 'Class 8', mastery: '98%' },
                  { name: 'Sophia Lee', grade: 'Class 7', mastery: '92%' },
                  { name: 'Michael Chen', grade: 'Class 8', mastery: '95%' },
                  { name: 'Amina Yusuf', grade: 'Class 9', mastery: '90%' }
                ].map(student => (
                  <li key={student.name} className="students-list__item">
                    <div className="students-list__avatar" />
                    <div className="students-list__meta">
                      <span className="students-list__name">{student.name}</span>
                      <span className="students-list__grade">{student.grade}</span>
                    </div>
                    <span className="students-list__score">{student.mastery}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card card--stretch">
              <div className="card__header">
                <h2>Total attendance report</h2>
                <span className="card__subtitle">Weekly</span>
              </div>
              <div className="chart-placeholder">
                <div className="chart-placeholder__line" />
              </div>
            </div>
          </div>

          {/* Teaching lessons */}
          <div className="card card--full">
            <div className="card__header">
              <h2>Teaching lessons</h2>
            </div>
            <div className="lessons-list">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="lessons-list__item">
                  <div>
                    <div className="lessons-list__time">Today, 10:30 AM</div>
                    <div className="lessons-list__title">High fidelity wireframes</div>
                  </div>
                  <div className="lessons-list__meta">
                    <span>2 lessons</span>
                    <span>•</span>
                    <span>60 min</span>
                    <span>•</span>
                    <span>Mathematics</span>
                  </div>
                  <button className="lessons-list__reminder">Reminder</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right: sidebar content */}
        <aside className="dashboard__side">
          <div className="card">
            <div className="card__header">
              <h2>May 2023</h2>
            </div>
            <div className="calendar-placeholder">
              <div className="calendar-placeholder__grid" />
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h2>Upcoming events</h2>
            </div>
            <ul className="events-list">
              <li>
                <span className="events-list__time">9:00 am</span>
                <div>
                  <div className="events-list__title">Biology</div>
                  <div className="events-list__subtitle">
                    Cellular metabolism, enzymes &amp; ecology of life.
                  </div>
                </div>
              </li>
              <li>
                <span className="events-list__time">11:00 am</span>
                <div>
                  <div className="events-list__title">Chemistry</div>
                  <div className="events-list__subtitle">
                    Stoichiometry and chemical reactions.
                  </div>
                </div>
              </li>
              <li>
                <span className="events-list__time">1:00 pm</span>
                <div>
                  <div className="events-list__title">Physics</div>
                  <div className="events-list__subtitle">
                    Motion, forces and energy conservation.
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div className="card">
            <div className="card__header card__header--space-between">
              <h2>My notes</h2>
              <button className="btn btn-small">Add note</button>
            </div>
            <ul className="notes-list">
              {['Prepare questions for final test', 'Review payment reports', 'Schedule parent meeting'].map(
                note => (
                  <li key={note} className="notes-list__item">
                    <span className="notes-list__bullet" />
                    <span>{note}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default HomePage