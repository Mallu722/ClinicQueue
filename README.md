# ClinicQueue — Technical Requirements Document (TRD)

**Version:** 1.0  
**Status:** Proposed Engineering Baseline  
**Related Document:** ClinicQueue PRD v1.0  
**Architecture:** Modular Monolith  
**Frontend:** React + TypeScript + Tailwind CSS  
**Backend:** Node.js + Express.js + TypeScript  
**Database:** PostgreSQL + Prisma ORM  
**Delivery:** Responsive Website + Progressive Web App

## 1. Technical Objective

The purpose of this document is to define how ClinicQueue will be implemented, secured, tested, deployed, and maintained.

The architecture must support:
- Appointment and walk-in management.
- Concurrent-safe queue token generation.
- Clinic-specific patient records.
- Role-based clinical-data access.
- Scheduled WhatsApp reminders.
- Daily, weekly, and monthly analytics.
- Reliable operation for an initial single-clinic pilot and a path to multi-clinic expansion.

The initial system will use a modular monolith rather than microservices to reduce complexity for a 1–2 developer team.

## 2. System Architecture

### High-level components

1. Responsive React PWA.
2. Express REST API.
3. PostgreSQL relational database.
4. Prisma ORM.
5. Background job processor for reminders.
6. WhatsApp Business Platform integration.
7. Webhook receiver for message status events.
8. Analytics aggregation layer.
9. Logging, monitoring, and backup services.

### Request flow

Browser/PWA → HTTPS → Express API → Authentication and authorization → Business logic → PostgreSQL.

For notifications:

Business event → Notification job → Permission and template checks → WhatsApp provider API → Webhook status update → Notification record.

For analytics:

Authorized dashboard request → Validated filters → Tenant-scoped aggregate query → API response → Recharts visualization.

## 3. Architecture Decisions

### 3.1 Modular monolith

The backend shall be organized into modules within one deployable application:

- Authentication and authorization.
- Clinic management.
- Doctor schedules.
- Appointments.
- Patient management.
- Queue management.
- Visits and prescriptions.
- Follow-ups.
- Notifications.
- Analytics.
- Audit logging.

Each module should have clear service boundaries and validation rules.

### 3.2 PostgreSQL

PostgreSQL is selected because the domain contains strongly related records and requires transaction-safe booking, queue management, and consistent reporting.

### 3.3 Prisma ORM

Prisma will manage database schema definitions, migrations, and typed database queries.

Critical concurrency-sensitive operations must use appropriate database transactions and constraints rather than relying exclusively on application-level checks.

### 3.4 PWA-first frontend

The same responsive web application will support patient, receptionist, clinician, and owner experiences according to their permissions.

A native mobile application is excluded from the initial release.

## 4. Proposed Repository Structure

```text
clinicqueue/
├── client/
│   ├── public/
│   │   ├── icons/
│   │   ├── manifest.webmanifest
│   │   └── assets/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── patient/
│   │   │   ├── receptionist/
│   │   │   ├── doctor/
│   │   │   └── owner/
│   │   ├── features/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   ├── types/
│   │   └── main.tsx
│   └── package.json
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── clinics/
│   │   │   ├── doctors/
│   │   │   ├── schedules/
│   │   │   ├── appointments/
│   │   │   ├── patients/
│   │   │   ├── queue/
│   │   │   ├── visits/
│   │   │   ├── prescriptions/
│   │   │   ├── followups/
│   │   │   ├── notifications/
│   │   │   ├── analytics/
│   │   │   └── audit/
│   │   ├── jobs/
│   │   ├── integrations/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   └── package.json
├── docs/
│   ├── PRD.md
│   ├── TRD.md
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
├── .env.example
├── .gitignore
└── README.md
```

This is a proposed structure. It can be adjusted during implementation, but the separation between UI, API, business logic, integrations, and database access should remain.

## 5. Technology Requirements

### Frontend
- React.
- TypeScript with strict type checking.
- Tailwind CSS.
- React Router.
- Recharts.
- A form validation library and schema-based validation.
- PWA manifest and service worker.
- Accessible components and internationalization support.

### Backend
- Supported Node.js LTS release.
- Express.js.
- TypeScript.
- Prisma ORM.
- Request validation with a schema validation library.
- Structured logging.
- Background job processing.
- REST API.

### Data layer
- PostgreSQL.
- Database migrations.
- Foreign-key constraints.
- Unique constraints.
- Transaction support.
- Automated backups.

### Testing
- Unit tests.
- Integration tests.
- API tests.
- Browser-based end-to-end tests.
- Permission and tenant-isolation tests.
- Load and concurrency tests for critical operations.

Exact dependency versions should be locked in the package manager lockfile.

## 6. Data Model

All primary entities should use stable identifiers, preferably UUIDs.

### 6.1 Core tables

**clinics**
- `id`
- `name`
- `slug`
- `address`
- `timezone`
- `phone`
- `status`
- `created_at`
- `updated_at`

**users**
- `id`
- `email`, nullable where appropriate
- `phone`, nullable where appropriate
- `password_hash` or external identity reference
- `status`
- `created_at`
- `updated_at`

**clinic_memberships**
- `id`
- `clinic_id`
- `user_id`
- `role`
- `status`
- `created_at`

Unique constraint: `(clinic_id, user_id)`.

**doctors**
- `id`
- `clinic_id`
- `display_name`
- `specialization`
- `status`

**doctor_schedules**
- `id`
- `clinic_id`
- `doctor_id`
- `day_of_week`
- `start_time`
- `end_time`
- `break_configuration`
- `effective_from`
- `effective_until`

**patients**
- `id`
- `clinic_id`
- `patient_reference`
- `display_name`
- `phone`, if required
- `date_of_birth`, only if required
- `status`
- `created_at`
- `updated_at`

Unique constraint: `(clinic_id, patient_reference)`.

Do not assume phone number alone is sufficient to identify a patient.

**patient_consents**
- `id`
- `clinic_id`
- `patient_id`
- `purpose`
- `channel`
- `status`
- `captured_at`
- `withdrawn_at`
- `recorded_by`

**appointments**
- `id`
- `clinic_id`
- `doctor_id`
- `patient_id`
- `scheduled_start`
- `scheduled_end`
- `status`
- `source`
- `confirmed_at`
- `cancelled_at`
- `created_at`
- `updated_at`

**queue_entries**
- `id`
- `clinic_id`
- `doctor_id`
- `patient_id`
- `appointment_id`, nullable
- `queue_session_id`
- `token_number`
- `status`
- `checked_in_at`
- `consultation_started_at`
- `completed_at`
- `created_at`
- `updated_at`

Unique constraint: `(clinic_id, queue_session_id, token_number)`.

**visits**
- `id`
- `clinic_id`
- `patient_id`
- `doctor_id`
- `appointment_id`, nullable
- `queue_entry_id`, nullable
- `visit_date`
- `status`
- `created_at`
- `updated_at`

**clinical_notes**
- `id`
- `clinic_id`
- `visit_id`
- `reason_for_visit`
- `assessment`
- `clinical_notes`
- `author_id`
- `created_at`
- `updated_at`

**prescriptions**
- `id`
- `clinic_id`
- `visit_id`
- `medicine_name`
- `strength`
- `dosage`
- `frequency`
- `duration`
- `instructions`
- `prescribed_by`
- `created_at`

**follow_up_plans**
- `id`
- `clinic_id`
- `visit_id`
- `patient_id`
- `scheduled_date`
- `status`
- `created_by`
- `created_at`
- `updated_at`

**notifications**
- `id`
- `clinic_id`
- `patient_id`
- `appointment_id`, nullable
- `follow_up_id`, nullable
- `channel`
- `notification_type`
- `scheduled_at`
- `status`
- `provider_message_id`
- `attempt_count`
- `last_error_code`
- `created_at`
- `updated_at`

**audit_logs**
- `id`
- `clinic_id`
- `actor_user_id`
- `action`
- `resource_type`
- `resource_id`
- `occurred_at`
- `request_id`
- `metadata`

Audit metadata must not unnecessarily duplicate clinical notes, prescriptions, authentication secrets, or other sensitive data.

### 6.2 Data integrity rules

- Foreign keys must enforce relationships.
- Patient records must be clinic-scoped.
- Appointment and queue states must use controlled values.
- Historical visits must not be silently overwritten.
- Token generation must be transaction-safe.
- Notification processing must be idempotent.
- Timestamps should be stored consistently, preferably in UTC, and displayed in the clinic's configured timezone.
- Analytics must distinguish completed visits from bookings and unique patients.
- Clinical records must be accessible only to authorized roles.

## 7. Role-Based Access Control

Proposed permission matrix:

| Operation | Owner | Receptionist | Clinician | Patient |
|---|---|---|---|---|
| Manage clinic configuration | Yes | Limited | Limited | No |
| Manage appointments | Yes | Yes | Authorized scope | Own bookings |
| Manage queue | Yes | Yes | Authorized scope | View permitted status |
| Register patients | Yes | Yes | Authorized scope | Limited self-service |
| View clinical notes | Restricted by policy | No by default | Authorized | Not in initial MVP |
| Record prescriptions | No by default | No | Yes | No |
| View operational analytics | Yes | Limited | Limited | No |
| Manage staff roles | Yes | No | No | No |

A clinic owner is not automatically granted unrestricted access to detailed clinical records. Permissions must reflect legitimate workflow requirements.

Every protected API request must validate authentication, clinic membership, role, resource ownership, and the requested operation.

## 8. Queue Engine Requirements

### Token generation

Token creation must occur inside a database transaction or equivalent concurrency-safe mechanism.

The system must:
- Determine the active queue session.
- Allocate the next valid token.
- Prevent duplicate token allocation.
- Store the queue entry.
- Commit the transaction.
- Return the generated token.

Do not generate tokens solely by reading the highest token number and incrementing it without concurrency protection.

### Queue state machine

Allowed states:

`WAITING → IN_CONSULTATION → COMPLETED`

Other allowed transitions include:
- `WAITING → CANCELLED`
- `WAITING → SKIPPED`
- `SKIPPED → WAITING`, if authorized
- `IN_CONSULTATION → WAITING`, if a consultation is interrupted and the clinic permits it.

Every transition must be validated and audited.

### Waiting-time calculation

Initial approach:

Estimated remaining time = estimated remaining active consultation time + relevant queue delays.

The implementation should use actual queue state and historical consultation-duration statistics when sufficient data exists.

The UI should display a range rather than a guaranteed exact time.

If there is insufficient data, a safe fallback such as "Waiting time unavailable" should be displayed.

The system must not imply real-time accuracy when staff updates are stale.

## 9. Appointment Engine Requirements

- Store clinic and doctor schedules.
- Calculate available slots from working hours and configured breaks.
- Prevent overlapping confirmed bookings according to the clinic's booking rules.
- Support appointment requests, confirmation, rescheduling, cancellation, and no-show outcomes.
- Preserve appointment history.
- Link appointments to queue entries and actual visits when applicable.
- Handle timezone conversions consistently.
- Exclude cancelled or future bookings from inappropriate attendance metrics.

Concurrency-sensitive booking checks must be enforced at the database or transactional service layer.

## 10. WhatsApp Notification Architecture

### Components

1. Notification scheduling service.
2. Background job processor.
3. WhatsApp provider client.
4. Template configuration.
5. Webhook receiver.
6. Notification status repository.
7. Retry and failure handling.

### Processing flow

1. A valid appointment or follow-up event occurs.
2. The backend verifies relevant patient communication preferences.
3. The notification job is created with an idempotency key.
4. A worker claims the job.
5. The worker checks schedule, template configuration, and current booking status.
6. The worker sends the message through the configured provider.
7. The provider message identifier is stored.
8. Webhook events update the notification status.
9. Failed messages are handled according to the retry policy.

### Reliability rules

- Use idempotency keys for job creation.
- Verify webhook authenticity according to provider requirements.
- Handle duplicate and out-of-order webhook events.
- Do not retry permanent failures indefinitely.
- Do not send reminders after relevant cancellation or opt-out.
- Store only necessary message metadata.
- Never expose provider credentials in frontend code.
- Keep message bodies free of unnecessary clinical information.

### Suggested initial reminder schedule

- Appointment confirmation: after clinic confirmation.
- Appointment reminder: 24 hours before the appointment, if configured.
- Additional reminder: optional, based on clinic configuration and patient preference.
- Follow-up reminder: according to the clinician-defined follow-up date and configured schedule.
- Delay notification: after an authorized clinic status change.

The final schedule must account for timezones, cancellations, rescheduling, consent, and applicable messaging policies.

## 11. Analytics Implementation

### Visitor aggregation

The main visitor chart shall support:

- Daily: last 7 or 30 days.
- Weekly: last 8 or 12 weeks.
- Monthly: last 6 or 12 months.

The separate hourly visitor graph is excluded from the MVP.

### Data sources

Analytics will derive from:
- Queue check-in timestamps.
- Appointment statuses.
- Visit completion timestamps.
- Patient first-visit records.
- Follow-up status transitions.
- Consultation start timestamps.

### Query rules

- Apply clinic authorization before aggregation.
- Apply the clinic's timezone when grouping timestamps into dates.
- Use the same definitions across all time ranges.
- Exclude cancelled bookings from completed-visit counts.
- Distinguish total visits from unique patients.
- Treat missing timestamps explicitly.
- Use pagination for detailed records and aggregate queries for charts.
- Do not expose clinical notes or medicine details in operational reports.

### Performance strategy

Initial analytics can use indexed SQL aggregation queries.

If query performance becomes insufficient, introduce:
- Pre-aggregated daily summaries.
- Scheduled summary refreshes.
- Selective caching.
- Additional indexes based on measured query plans.

Do not introduce a separate analytics warehouse in the initial release.

## 12. API Design

All endpoints shall use versioned REST routes, for example `/api/v1`.

### Authentication
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Clinics and schedules
- `GET /api/v1/clinics/:clinicId`
- `PATCH /api/v1/clinics/:clinicId`
- `GET /api/v1/clinics/:clinicId/schedules`

### Appointments
- `POST /api/v1/appointments`
- `GET /api/v1/appointments`
- `GET /api/v1/appointments/:id`
- `PATCH /api/v1/appointments/:id/status`

### Queue
- `POST /api/v1/queue/entries`
- `GET /api/v1/clinics/:clinicId/queue`
- `PATCH /api/v1/queue/entries/:id/status`

### Patients and visits
- `POST /api/v1/patients`
- `GET /api/v1/patients/:id`
- `GET /api/v1/patients/:id/visits`
- `POST /api/v1/patients/:id/visits`
- `POST /api/v1/visits/:id/prescriptions`

### Follow-ups and notifications
- `POST /api/v1/visits/:id/follow-ups`
- `GET /api/v1/notifications`
- `POST /api/v1/webhooks/whatsapp`

### Analytics
- `GET /api/v1/analytics/visits?period=daily`
- `GET /api/v1/analytics/visits?period=weekly`
- `GET /api/v1/analytics/visits?period=monthly`
- `GET /api/v1/analytics/wait-times`
- `GET /api/v1/analytics/appointment-outcomes`
- `GET /api/v1/analytics/follow-ups`

All query parameters must be validated. Protected resources must be clinic-scoped and authorization-checked.

Use a consistent error response format containing a safe error code, human-readable message, and request identifier where appropriate.

## 13. PWA Requirements

- Responsive layouts for mobile, tablet, and desktop.
- Valid web app manifest.
- Installable PWA experience where supported.
- Appropriate app icons.
- HTTPS deployment.
- Service worker for safe static asset caching.
- Accessible loading and error states.
- Clear stale-data indicators.
- Localization support.

Clinical records and private API responses must not be indiscriminately cached by the service worker.

Live queue data requires connectivity. Full offline synchronization is excluded from the MVP.

Browser push notifications may be considered where supported, but WhatsApp remains the primary reminder channel in the planned release.

## 14. Security Requirements

### Authentication
- Secure password hashing or a trusted authentication provider.
- Session management and expiration.
- Rate limiting for login and sensitive operations.
- Secure cookie configuration when cookie-based sessions are used.
- Appropriate protection against CSRF where applicable.

### Authorization
- Server-side role checks.
- Clinic-level tenant isolation.
- Resource ownership validation.
- Least-privilege permissions.
- Protected patient and prescription endpoints.

### Data protection
- HTTPS.
- Secrets stored in environment or secret-management services.
- No real patient data in public test environments.
- Database backups.
- Restricted administrative access.
- Audit logs for sensitive access and modifications.
- Documented retention and deletion procedures.

### API security
- Schema-based input validation.
- Request size limits.
- Rate limiting.
- Safe error handling.
- Parameterized database access through the ORM.
- Dependency updates and vulnerability review.
- Webhook signature verification.
- No sensitive information in application logs.

Applicable Indian data-protection and healthcare requirements must be reviewed before production use. Technical implementation alone does not establish legal compliance.

## 15. Error Handling and Observability

The system should record:
- API errors.
- Authentication and authorization failures.
- Database failures.
- Queue-operation failures.
- Background job failures.
- WhatsApp delivery failures.
- Webhook processing errors.
- Performance metrics.

Logs should include timestamps, request identifiers, module names, and safe error details.

Logs must not include passwords, tokens, full clinical notes, prescription bodies, or unnecessary patient identifiers.

Monitoring should cover:
- API health.
- Database connectivity.
- Background job backlog.
- Failed reminder rate.
- Queue-update latency.
- Backup status.
- Critical error frequency.

## 16. Testing Requirements

### Unit tests
- Appointment state transitions.
- Queue token generation logic.
- Waiting-time calculation.
- Permission checks.
- Analytics metric calculations.
- Notification scheduling rules.

### Integration tests
- API and PostgreSQL.
- Appointment booking transactions.
- Patient visit creation.
- Notification job processing.
- WhatsApp webhook status updates.
- Analytics queries.

### End-to-end tests
- Patient requests an appointment.
- Receptionist confirms a booking.
- Walk-in token is created.
- Queue status is updated.
- Clinician records a visit.
- Follow-up reminder is scheduled.
- Owner reviews analytics.

### Security tests
- Unauthorized access to clinical notes.
- Cross-clinic data access.
- Patient record access violations.
- Concurrent token generation.
- Invalid webhook signatures.
- Session expiration.
- Sensitive data leakage through responses or logs.

### Performance tests
- Concurrent booking requests.
- Queue status update load.
- Analytics query performance.
- Background job processing under expected pilot traffic.

## 17. Deployment and Environments

Three environments are recommended:

**Development**
- Local development database.
- Synthetic test data.
- Local environment variables.

**Staging**
- Production-like configuration.
- Synthetic data only.
- End-to-end and integration tests.
- WhatsApp test configuration where available.

**Production**
- Approved clinic configuration.
- Real patient data only after required safeguards are in place.
- HTTPS.
- Restricted credentials.
- Automated backups.
- Monitoring and incident procedures.

### Deployment process

1. Developer creates a feature branch.
2. Changes are reviewed and tested.
3. CI runs linting, type checks, and automated tests.
4. Database migrations are reviewed.
5. Application is deployed to staging.
6. Smoke tests are performed.
7. Approved changes are deployed to production.
8. Health checks and logs are reviewed.

Destructive database migrations must be handled carefully. Production changes must have a recovery strategy.

## 18. Environment Variables

The application may require configuration similar to:

```text
NODE_ENV=
PORT=
DATABASE_URL=
APP_BASE_URL=
FRONTEND_ORIGIN=
AUTH_SECRET=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
```

These are configuration names, not actual credentials.

Secrets must never be committed to GitHub or included in frontend bundles. `.env.example` should contain placeholders only.

## 19. Suggested CI/CD Checks

For every pull request:
- Formatting and lint checks.
- TypeScript compilation.
- Unit tests.
- API integration tests where configured.
- Dependency vulnerability checks.
- Build validation.
- Database migration validation.

For deployment:
- Staging smoke tests.
- Production health checks.
- Migration status verification.
- Backup and rollback readiness.

## 20. Eight-Week Technical Implementation Plan

### Week 1
- Confirm functional requirements.
- Create architecture diagrams.
- Design database schema.
- Validate clinic workflows.

### Week 2
- Create repository structure.
- Set up React and Express.
- Configure PostgreSQL and Prisma.
- Implement authentication and permissions.

### Week 3
- Build clinic schedules and appointment APIs.
- Implement appointment status transitions.
- Add booking validation.

### Week 4
- Implement transactional token generation.
- Build queue state machine.
- Add patient queue view and waiting-time estimates.

### Week 5
- Add patient profiles, visit history, prescriptions, and follow-ups.
- Implement clinical-record access controls.
- Add audit logging.

### Week 6
- Implement daily, weekly, and monthly analytics.
- Validate metric definitions.
- Add responsive charts and reporting filters.

### Week 7
- Configure WhatsApp integration.
- Implement scheduled jobs and webhooks.
- Test retries, duplicate events, and opt-out behavior.

### Week 8
- Perform security and reliability testing.
- Deploy the pilot environment.
- Train clinic staff.
- Monitor usage and fix issues.

The timeline assumes a tightly scoped MVP and timely access to a pilot clinic. Provider approval, legal review, or unresolved workflow requirements may extend the schedule.

## 21. Technical Acceptance Criteria

The MVP is technically ready for a supervised pilot when:

1. Appointments can be created, confirmed, rescheduled, and cancelled correctly.
2. Concurrent token creation does not produce duplicate tokens.
3. Queue status transitions follow the defined rules.
4. Patient history is restricted to authorized roles.
5. Visit and prescription records are linked correctly.
6. WhatsApp reminders are scheduled and their provider status is recorded.
7. Daily, weekly, and monthly visitor analytics reconcile with source records.
8. The application is responsive on supported mobile and desktop browsers.
9. Cross-clinic authorization tests pass.
10. Backups and recovery procedures have been tested.
11. Critical workflows have automated integration or end-to-end coverage.
12. The deployment process is documented.

## 22. Known Technical Risks

| Risk | Mitigation |
|---|---|
| Duplicate tokens under concurrent requests | Database constraints and transactions |
| Incorrect patient matching | Verification and duplicate-record handling |
| Stale queue information | Last-updated indicators and explicit stale states |
| Duplicate WhatsApp messages | Idempotent jobs and webhook processing |
| Unauthorized clinical access | Server-side role and tenant checks |
| Slow analytics | Indexed queries and measured aggregation optimization |
| Lost scheduled reminders | Durable jobs, retry policy, and failure monitoring |
| Scope expansion | Modular architecture and strict MVP boundaries |
| PWA caching sensitive data | Explicit cache rules and exclusion of private API responses |

## 23. Future Technical Extensions

After successful MVP validation:
- Native Flutter application.
- SMS notification provider.
- More advanced reporting.
- Carefully validated waiting-time forecasting.
- Multi-clinic and multi-branch management.
- Billing integrations.
- Supported ABDM interoperability integrations.
- Additional localization and accessibility improvements.

Each extension requires a separate scope and security review.

## 24. Final Technical Decision

ClinicQueue will be implemented as a TypeScript-based modular monolith with a React PWA, Express REST API, PostgreSQL, Prisma ORM, background notification processing, official WhatsApp Business integration, and tenant-scoped analytics.

The architecture prioritizes:
- Correctness of appointments and queue operations.
- Privacy of patient records.
- Maintainability for a small development team.
- Reliable reminders.
- Accurate daily, weekly, and monthly reporting.
- A straightforward path from one pilot clinic to a multi-clinic SaaS platform.

The MVP will be considered successful only after functional validation, security testing, real-clinic workflow validation, and evidence of customer willingness to pay.
