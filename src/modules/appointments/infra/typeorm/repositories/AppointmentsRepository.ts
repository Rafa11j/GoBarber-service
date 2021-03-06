import { getRepository, Repository, Raw } from 'typeorm';

import { IAppointmentsRepository } from '@modules/appointments/repositories/IAppointmentRepository';
import { ICreateAppointmentDTO } from '@modules/appointments/dtos/ICreateAppointmentDTO';
import findAllInMonthFromProviderDTO from '@modules/appointments/dtos/IFindAllInMonthFromProviderDTO';
import IFindAllInDayFromProviderDTO from '@modules/appointments/dtos/IFindAllInDayFromProviderDTO';
import Appointment from '../entities/Appointment';

class AppointmentsRepository implements IAppointmentsRepository {
  private ormRepository: Repository<Appointment>

  constructor() {
    this.ormRepository = getRepository(Appointment);
  }

  public async findByDate(date: Date): Promise<Appointment | undefined> {
    const findAppointment = await this.ormRepository.findOne({
      where: { date },
    });

    return findAppointment;
  }

  public async findAllInMonthFromProvider(
    { provider_id, month, year }: findAllInMonthFromProviderDTO,
  ): Promise<Appointment[]> {
    const parsedMonth = String(month).padStart(2, '0');

    const appointments = await this.ormRepository.find({
      where: {
        provider_id,
        date: Raw((dateFieldame) => `to_char(${dateFieldame}, 'MM-YYYY') = '${parsedMonth}-${year}'`),
      },
    })

    return appointments;
  }

  public async findAllInDayFromProvider(
    {
      day, month, year, provider_id,
    }: IFindAllInDayFromProviderDTO,
  ): Promise<Appointment[]> {
    const parsedDay = String(day).padStart(2, '0');
    const parsedMonth = String(month).padStart(2, '0');

    const appointments = await this.ormRepository.find({
      where: {
        provider_id,
        date: Raw((dateFieldame) => `to_char(${dateFieldame}, 'DD-MM-YYYY') = '${parsedDay}-${parsedMonth}-${year}'`),
      },
    })

    return appointments;
  }

  public async create({ date, provider_id, user_id }: ICreateAppointmentDTO): Promise<Appointment> {
    const appointment = this.ormRepository.create({
      user_id,
      provider_id,
      date,
    });

    await this.ormRepository.save(appointment);
    return appointment;
  }
}

export default AppointmentsRepository;
