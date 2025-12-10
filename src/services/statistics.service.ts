import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Units } from 'src/db/entities/Units';
import { Locations } from 'src/db/entities/Locations';
import { Status } from 'src/db/entities/Status';
import { Model } from 'src/db/entities/Model';
import { StatisticsFilterDto, TimeframeType } from 'src/core/dto/statistics/statistics.dto';
import moment from 'moment';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Units)
    private unitsRepo: Repository<Units>,
    @InjectRepository(Locations)
    private locationsRepo: Repository<Locations>,
    @InjectRepository(Status)
    private statusRepo: Repository<Status>,
    @InjectRepository(Model)
    private modelRepo: Repository<Model>,
  ) {}

  private getDateRange(timeframe: any) {
    const { type, startDate, endDate } = timeframe;
    let dateFrom: Date;
    let dateTo: Date;

    if (startDate && endDate) {
      dateFrom = moment(startDate).startOf('day').toDate();
      dateTo = moment(endDate).endOf('day').toDate();
      
      if (dateFrom > dateTo) {
        throw new HttpException(
          'Start date must be before or equal to end date',
          HttpStatus.BAD_REQUEST
        );
      }
    } else {
      const now = moment();
      switch (type) {
        case TimeframeType.DAILY:
          dateFrom = now.startOf('day').toDate();
          dateTo = now.endOf('day').toDate();
          break;
        case TimeframeType.WEEKLY:
          dateFrom = now.startOf('isoWeek').toDate();
          dateTo = now.endOf('isoWeek').toDate();
          break;
        case TimeframeType.MONTHLY:
          dateFrom = now.startOf('month').toDate();
          dateTo = now.endOf('month').toDate();
          break;
        case TimeframeType.QUARTERLY:
          dateFrom = now.startOf('quarter').toDate();
          dateTo = now.endOf('quarter').toDate();
          break;
        case TimeframeType.YEARLY:
          dateFrom = now.startOf('year').toDate();
          dateTo = now.endOf('year').toDate();
          break;
        default:
          dateFrom = now.startOf('day').toDate();
          dateTo = now.endOf('day').toDate();
      }
    }

    return { dateFrom, dateTo };
  }

  async getDashboardData(filters: StatisticsFilterDto) {
    try {
      const { dateFrom, dateTo } = this.getDateRange(filters.timeframe);

      const totalUnits = await this.unitsRepo.count({ 
        where: { active: true }
      });

      let unitsInStorage = 0;
      const hasValidLocationFilter = filters.locationIds?.length && 
        filters.locationIds.some(id => id && id !== "string" && id.trim() !== "");
      
      if (hasValidLocationFilter) {
        const validLocationIds = filters.locationIds.filter(id => id && id !== "string" && id.trim() !== "");
        unitsInStorage = await this.unitsRepo.count({
          where: { 
            active: true,
            location: { locationId: In(validLocationIds) }
          }
        });
      } else {
        const warehouseLocationCodes = ['WAREHOUSE_4', 'WAREHOUSE_5', 'OPEN_AREA'];
        const warehouseLocations = await this.locationsRepo.find({
          where: { 
            active: true,
            locationCode: In(warehouseLocationCodes)
          }
        });
        
        if (warehouseLocations.length > 0) {
          const warehouseLocationIds = warehouseLocations.map(loc => loc.locationId);
          unitsInStorage = await this.unitsRepo.count({
            where: { 
              active: true,
              location: { locationId: In(warehouseLocationIds) }
            }
          });
        }
      }

      const holdStatus = await this.statusRepo.findOne({ where: { name: 'HOLD' } });
      const unitsOnHold = holdStatus ? await this.unitsRepo.count({
        where: { 
          active: true,
          status: { statusId: holdStatus.statusId }
        }
      }) : 0;

      const forDeliveryStatus = await this.statusRepo.findOne({ where: { name: 'FOR DELIVERY' } });
      const unitsForDelivery = forDeliveryStatus ? await this.unitsRepo.count({
        where: { 
          active: true,
          status: { statusId: forDeliveryStatus.statusId }
        }
      }) : 0;

      // Get filtered units created in the timeframe
      const filteredUnitsQuery = this.unitsRepo
        .createQueryBuilder('unit')
        .where('unit.active = :active', { active: true })
        .andWhere('unit.dateCreated BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });

      this.applyFilters(filteredUnitsQuery, filters);
      
      const totalUnitsInTimeframe = await filteredUnitsQuery.getCount();

      // Get units by color for the timeframe (with filters)
      const unitsByColorQuery = this.unitsRepo
        .createQueryBuilder('unit')
        .select('unit.color', 'color')
        .addSelect('COUNT(unit.unitId)', 'count')
        .where('unit.active = :active', { active: true })
        .andWhere('unit.dateCreated BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });

      this.applyFilters(unitsByColorQuery, filters);
      
      const unitsByColor = await unitsByColorQuery
        .groupBy('unit.color')
        .orderBy('count', 'DESC')
        .getRawMany();

      // Get units by model for the timeframe (with filters)
      const unitsByModelQuery = this.unitsRepo
        .createQueryBuilder('unit')
        .select('model.modelName', 'modelName')
        .addSelect('COUNT(unit.unitId)', 'count')
        .leftJoin('unit.model', 'model')
        .where('unit.active = :active', { active: true })
        .andWhere('unit.dateCreated BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });

      this.applyFilters(unitsByModelQuery, filters);
      
      const unitsByModel = await unitsByModelQuery
        .groupBy('model.modelName')
        .orderBy('count', 'DESC')
        .getRawMany();

      // Format color data
      const formattedColors = unitsByColor.map(item => ({
        color: item.color || 'Unknown',
        count: parseInt(item.count || '0', 10),
        percentage: totalUnitsInTimeframe > 0 ? 
          ((parseInt(item.count || '0', 10) / totalUnitsInTimeframe) * 100).toFixed(2) + '%' : '0%'
      }));

      // Format model data for chart - ensure valid Chart.js format
      const modelLabels = unitsByModel.length > 0 
        ? unitsByModel.map(item => item.modelName || 'Unknown')
        : ['No Data'];
      const modelData = unitsByModel.length > 0
        ? unitsByModel.map(item => parseInt(item.count || '0', 10))
        : [0];
      
      const modelColors = this.generateColors(modelLabels.length);
      const unitsByModelChart = {
        labels: modelLabels,
        datasets: [{
          label: 'Units Created',
          data: modelData,
          backgroundColor: modelColors,
          borderColor: modelColors.map(c => {
            // Darken color for border (simple approach)
            if (c.startsWith('#')) {
              return c; // Use same color for border
            }
            return c;
          }),
          borderWidth: 2
        }]
      };

      // Format color data for chart - ensure valid Chart.js format
      const colorLabels = formattedColors.length > 0
        ? formattedColors.map(item => item.color || 'Unknown')
        : ['No Data'];
      const colorData = formattedColors.length > 0
        ? formattedColors.map(item => item.count)
        : [0];
      
      const colorChartColors = this.generateColors(colorLabels.length);
      const unitsByColorChart = {
        labels: colorLabels,
        datasets: [{
          label: 'Units by Color',
          data: colorData,
          backgroundColor: colorChartColors,
          borderColor: colorChartColors.map(c => {
            // Darken color for border (simple approach)
            if (c.startsWith('#')) {
              return c; // Use same color for border
            }
            return c;
          }),
          borderWidth: 2
        }]
      };

      return {
        metadata: {
          generatedAt: new Date().toISOString(),
          timeframe: filters.timeframe,
          filtersApplied: this.getAppliedFilters(filters),
          dateRange: {
            from: dateFrom,
            to: dateTo
          }
        },
        summary: {
          totalUnits,
          unitsInStorage,
          unitsOnHold,
          unitsForDelivery,
          unitsCreatedInPeriod: totalUnitsInTimeframe
        },
        colorDistribution: formattedColors,
        chartData: {
          unitsByModel: unitsByModelChart,
          unitsByColor: unitsByColorChart
        }
      };
    } catch (error) {
      throw new HttpException(
        `Error retrieving dashboard data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // REPORT ENDPOINT - Production data (FIXED VERSION)
  async getProductionReport(filters: StatisticsFilterDto) {
    try {
      const { dateFrom, dateTo } = this.getDateRange(filters.timeframe);

      // Build base query for ALL units in timeframe - ALWAYS join status table
      const baseQuery = this.unitsRepo
        .createQueryBuilder('unit')
        .leftJoin('unit.status', 'status') // CRITICAL: Always join status for reports
        .where('unit.active = :active', { active: true })
        .andWhere('unit.dateCreated BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });

      this.applyFilters(baseQuery, filters);
      
      const totalUnitsInPeriod = await baseQuery.getCount();

      const deliveredUnitsQuery = baseQuery.clone();
      const deliveredUnits = await deliveredUnitsQuery
        .andWhere('status.name = :statusName', { statusName: 'DELIVERED' })
        .getCount();

      const unitsByModelQuery = this.unitsRepo
        .createQueryBuilder('unit')
        .select('model.modelName', 'modelname')
        .addSelect('COUNT(unit.unitId)', 'totalunits')
        .addSelect(`SUM(CASE WHEN status.name = 'DELIVERED' THEN 1 ELSE 0 END)`, 'deliveredunits')
        .leftJoin('unit.model', 'model')
        .leftJoin('unit.status', 'status') // Join status for CASE statement
        .where('unit.active = :active', { active: true })
        .andWhere('unit.dateCreated BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });

      // Apply filters to model query (reuse applyFilters method)
      this.applyFilters(unitsByModelQuery, filters);
    
      const unitsByModelRaw = await unitsByModelQuery
        .groupBy('model.modelName')
        .orderBy('COUNT(unit.unitId)', 'DESC')
        .getRawMany();

      const unitsByColorQuery = this.unitsRepo
        .createQueryBuilder('unit')
        .select('unit.color', 'color')
        .addSelect('COUNT(unit.unitId)', 'totalunits')
        .addSelect(`SUM(CASE WHEN status.name = 'DELIVERED' THEN 1 ELSE 0 END)`, 'deliveredunits')
        .leftJoin('unit.status', 'status') // Join status for CASE statement
        .where('unit.active = :active', { active: true })
        .andWhere('unit.dateCreated BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });

      // Apply filters to color query (reuse applyFilters method)
      this.applyFilters(unitsByColorQuery, filters);
    
      const unitsByColorRaw = await unitsByColorQuery
        .groupBy('unit.color')
        .orderBy('COUNT(unit.unitId)', 'DESC')
        .getRawMany();

      const deliveryRate = totalUnitsInPeriod > 0 ? 
        ((deliveredUnits / totalUnitsInPeriod) * 100).toFixed(2) + '%' : '0%';

      const periodDisplay = `${moment(dateFrom).format('MMM D, YYYY')} - ${moment(dateTo).format('MMM D, YYYY')}`.toUpperCase();

      const modelReportLabels = unitsByModelRaw.length > 0
        ? unitsByModelRaw.map(item => item.modelname || 'Unknown')
        : ['No Data'];
      const modelReportData = unitsByModelRaw.length > 0
        ? unitsByModelRaw.map(item => parseInt(item.totalunits || '0', 10))
        : [0];
      
      const filteredUnitsByModelChart = {
        labels: modelReportLabels,
        datasets: [{
          label: 'Total Units',
          data: modelReportData,
          backgroundColor: this.generateColors(modelReportLabels.length),
          borderColor: this.generateColors(modelReportLabels.length),
          borderWidth: 2
        }]
      };

      const totalVsDeliveredChart = {
        labels: ['Total Units Created', 'Units Delivered'],
        datasets: [{
          label: 'Units',
          data: [totalUnitsInPeriod, deliveredUnits],
          backgroundColor: ['#FF9800', '#2196F3'], // Orange and Blue
          borderColor: ['#F57C00', '#1976D2'], // Darker Orange and Blue
          borderWidth: 2
        }]
      };

      const modelTotalData = unitsByModelRaw.length > 0
        ? unitsByModelRaw.map(item => parseInt(item.totalunits || '0', 10))
        : [0];
      const modelDeliveredData = unitsByModelRaw.length > 0
        ? unitsByModelRaw.map(item => parseInt(item.deliveredunits || '0', 10))
        : [0];
      
      const unitsByModelComparisonChart = {
        labels: modelReportLabels,
        datasets: [
          {
            label: 'Total Units',
            data: modelTotalData,
            backgroundColor: '#FF9800', // Orange
            borderColor: '#F57C00', // Darker Orange
            borderWidth: 2
          },
          {
            label: 'Delivered Units',
            data: modelDeliveredData,
            backgroundColor: '#2196F3', // Blue
            borderColor: '#1976D2', // Darker Blue
            borderWidth: 2
          }
        ]
      };

      const colorComparisonLabels = unitsByColorRaw.length > 0
        ? unitsByColorRaw.map(item => item.color || 'Unknown')
        : ['No Data'];
      const colorTotalData = unitsByColorRaw.length > 0
        ? unitsByColorRaw.map(item => parseInt(item.totalunits || '0', 10))
        : [0];
      const colorDeliveredData = unitsByColorRaw.length > 0
        ? unitsByColorRaw.map(item => parseInt(item.deliveredunits || '0', 10))
        : [0];
      
      const unitsByColorComparisonChart = {
        labels: colorComparisonLabels,
        datasets: [
          {
            label: 'Total Units',
            data: colorTotalData,
            backgroundColor: '#FF9800', // Orange
            borderColor: '#F57C00', // Darker Orange
            borderWidth: 2
          },
          {
            label: 'Delivered Units',
            data: colorDeliveredData,
            backgroundColor: '#2196F3', // Blue
            borderColor: '#1976D2', // Darker Blue
            borderWidth: 2
          }
        ]
      };

      return {
        metadata: {
          generatedAt: new Date().toISOString(),
          timeframe: filters.timeframe,
          periodDisplay,
          filtersApplied: this.getAppliedFilters(filters),
          dateRange: {
            from: dateFrom,
            to: dateTo
          }
        },
        summary: {
          totalUnits: totalUnitsInPeriod,
          deliveredUnits,
          deliveryRate,
          pendingUnits: totalUnitsInPeriod - deliveredUnits
        },
        byModel: unitsByModelRaw.map(item => {
          const total = parseInt(item.totalunits || '0', 10);
          const delivered = parseInt(item.deliveredunits || '0', 10);
        return {
          modelName: item.modelname || 'Unknown',
          totalUnits: total,
          deliveredUnits: delivered,
          deliveryRate: total > 0 ? 
            ((delivered / total) * 100).toFixed(2) + '%' : '0%'
        };
      }),
      byColor: unitsByColorRaw.map(item => {
          const total = parseInt(item.totalunits || '0', 10);
          const delivered = parseInt(item.deliveredunits || '0', 10);
        return {
          color: item.color || 'Unknown',
          totalUnits: total,
          deliveredUnits: delivered,
          deliveryRate: total > 0 ? 
            ((delivered / total) * 100).toFixed(2) + '%' : '0%'
        };
      }),
      chartData: {
        totalUnitsByModel: filteredUnitsByModelChart,
        totalVsDelivered: totalVsDeliveredChart,
        unitsByModelComparison: unitsByModelComparisonChart,
        unitsByColorComparison: unitsByColorComparisonChart
      },
      insights: this.generateReportInsights(totalUnitsInPeriod, deliveredUnits)
    };
    } catch (error) {
      throw new HttpException(
        `Error retrieving production report: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Helper Methods
  private generateColors(count: number): string[] {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#F44336', '#4CAF50', '#2196F3', '#9C27B0',
      '#00BCD4', '#8BC34A', '#FF9800', '#795548', '#607D8B'
    ];
    return colors.slice(0, Math.min(count, colors.length));
  }

  private getAppliedFilters(filters: StatisticsFilterDto) {
    const applied = [];
    const hasValidLocationFilter = filters.locationIds?.length && 
      filters.locationIds.some(id => id && id !== "string" && id.trim() !== "");
    if (hasValidLocationFilter) {
      applied.push('Location Filter');
    }
    
    const hasValidModelFilter = filters.modelIds?.length && 
      filters.modelIds.some(id => id && id !== "string" && id.trim() !== "");
    if (hasValidModelFilter) {
      applied.push('Model Filter');
    }
    
    const hasValidStatusFilter = filters.statusNames?.length && 
      filters.statusNames.some(name => name && name !== "string" && name.trim() !== "");
    if (hasValidStatusFilter) {
      applied.push('Status Filter');
    }
    
    const hasValidColorFilter = filters.colors?.length && 
      filters.colors.some(color => color && color !== "string" && color.trim() !== "");
    if (hasValidColorFilter) {
      applied.push('Color Filter');
    }
    return applied;
  }

  private generateReportInsights(totalUnits: number, deliveredUnits: number) {
    const insights = [];
    
    if (totalUnits > 0) {
      const deliveryRate = (deliveredUnits / totalUnits) * 100;
      
      if (deliveryRate > 80) {
        insights.push('Excellent delivery performance (>80%)');
      } else if (deliveryRate > 60) {
        insights.push('Good delivery performance (60-80%)');
      } else if (deliveryRate < 30) {
        insights.push('Delivery rate needs improvement (<30%)');
      }
    }
    
    if (totalUnits > 100) {
      insights.push('High production volume (>100 units)');
    }
    
    if (deliveredUnits > totalUnits) {
      insights.push('More units delivered than built (clearing backlog)');
    }
    
    if (deliveredUnits === 0 && totalUnits > 0) {
      insights.push('No units delivered - focus on delivery process');
    }
    
    if (deliveredUnits > 0 && deliveredUnits === totalUnits) {
      insights.push('Perfect delivery rate (100%)');
    }
    
    return insights;
  }

  // Apply basic filters for dashboard queries
  private applyFilters(query: any, filters: StatisticsFilterDto) {
    // Apply location filter
    const hasValidLocationFilter = filters.locationIds?.length && 
      filters.locationIds.some(id => id && id !== "string" && id.trim() !== "");
    
    if (hasValidLocationFilter) {
      const validLocationIds = filters.locationIds.filter(id => id && id !== "string" && id.trim() !== "");
      const hasLocationJoin = query.expressionMap.aliases?.some(
        (alias: any) => alias.name === 'location'
      );
      if (!hasLocationJoin) {
        query.leftJoin('unit.location', 'location');
      }
      query.andWhere('location.locationId IN (:...locationIds)', { 
        locationIds: validLocationIds
      });
    }

    // Apply model filter
    const hasValidModelFilter = filters.modelIds?.length && 
      filters.modelIds.some(id => id && id !== "string" && id.trim() !== "");
    
    if (hasValidModelFilter) {
      const numericModelIds = filters.modelIds
        .filter(id => id && id !== "string" && id.trim() !== "" && !isNaN(Number(id)))
        .map(id => Number(id));
      
      if (numericModelIds.length > 0) {
        // Check if model join already exists
        const hasModelJoin = query.expressionMap.aliases?.some(
          (alias: any) => alias.name === 'model'
        );
        if (!hasModelJoin) {
          query.leftJoin('unit.model', 'model');
        }
        query.andWhere('model.modelId IN (:...modelIds)', { 
          modelIds: numericModelIds 
        });
      }
    }

    const hasValidStatusFilter = filters.statusNames?.length && 
      filters.statusNames.some(name => name && name !== "string" && name.trim() !== "");
    
    if (hasValidStatusFilter) {
      const validStatusNames = filters.statusNames.filter(name => name && name !== "string" && name.trim() !== "");
      const hasStatusJoin = query.expressionMap.aliases?.some(
        (alias: any) => alias.name === 'status'
      );
      if (!hasStatusJoin) {
        query.leftJoin('unit.status', 'status');
      }
      query.andWhere('status.name IN (:...statusNames)', { 
        statusNames: validStatusNames 
      });
    }

    // Apply color filter
    const hasValidColorFilter = filters.colors?.length && 
      filters.colors.some(color => color && color !== "string" && color.trim() !== "");
    
    if (hasValidColorFilter) {
      const validColors = filters.colors.filter(color => color && color !== "string" && color.trim() !== "");
      query.andWhere('unit.color IN (:...colors)', { 
        colors: validColors 
      });
    }
  }
}