import React from 'react'
import { withTranslation } from 'react-i18next';
import client from '../client'
import i18n from '../i18n';
import CalendarTable from './CalendarTable';
import { ChapterT } from './Chapter';
import { TaskT } from './Task';

type Props = {
  t: any
}
type Roles = {
  rolle: string
}

type ApiTask = {
  id: number
  title: string
  days: number
  responsible: Array<Roles>
  targets: Array<Roles>
  chapters: Array<ChapterT>
}

type MyState = {
  startDate: string
  responsible: string
  taskList: Array<ApiTask>,
  tasks: Array<TaskT>
}

class CalendarForm extends React.Component<Props, MyState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      startDate: new Date().toISOString().slice(0, 10),
      responsible: 'all',
      taskList: [],
      tasks: []
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    client.get('/tasks?_locale=' + i18n.language).then((response) => {
      this.setState({ taskList: response.data })
    })
  }

  onChangeStartDate = (e: React.FormEvent<HTMLInputElement>): void => {
    this.setState({ startDate: e.currentTarget.value });
  };

  onChangeResponsible = (e: React.FormEvent<HTMLSelectElement>): void => {
    this.setState({ responsible: e.currentTarget.value });
  };

  taskSort = (a: TaskT, b: TaskT) => {
    let aDate = a.deadline
    let bDate = b.deadline
    if (aDate < bDate) {
      return -1
    }
    if (aDate > bDate) {
      return 1
    }

    return 0
  }

  handleSubmit(event: any) {
    event.preventDefault();
    const startDate = new Date(this.state.startDate)
    const responsible = this.state.responsible

    const filteredDates = this.state.taskList.filter(function (task) {
      const rollen = task.responsible.map((resp) => resp.rolle)
      return responsible === 'all' ? true : rollen.includes(responsible)
    });

    const tasks = filteredDates.map(function (task) {
      let deadline = new Date(startDate.getTime() + task.days * 86400000)
      if (task.days === -1000) {
        deadline = startDate
        deadline.setMonth(0)
        deadline.setDate(1)
      }
      return { 'deadline': deadline, 'key': task.title, title: task.title, 'targets': task.targets, 'responsible': task.responsible, chapters: task.chapters }
    })
    this.setState({ tasks: tasks })
  }

  render() {
    const { t } = this.props;

    return (
      <div>
        <div className='calendar-form-container'>
          <form onSubmit={this.handleSubmit}>
            <ul className='calendar-form'>
              <li>
                <label>
                  {t('calendarPage.startDate')}
                </label>
                <input type="date" name="startDate" value={this.state.startDate} onChange={this.onChangeStartDate} />
              </li>
              <li>
                <label>
                  {t('calendarPage.responsible')}
                </label>
                <select name="responsible" value={this.state.responsible} onChange={this.onChangeResponsible}>
                  <option value="all">{t('calendarPage.responsibleOptions.all')}</option>
                  <option value="LL">{t('calendarPage.responsibleOptions.ll')}</option>
                  <option value="AL">{t('calendarPage.responsibleOptions.al')}</option>
                  <option value="C">{t('calendarPage.responsibleOptions.c')}</option>
                </select>
              </li>
              <li>
                <button type="submit"> {t('calendarPage.generate')}</button>
              </li>
            </ul>
          </form>
        </div>
        <CalendarTable tasks={this.state.tasks.sort(this.taskSort)} />
      </div>
    );
  }
}

export default withTranslation()(CalendarForm)