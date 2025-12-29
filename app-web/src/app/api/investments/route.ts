import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvestmentType, InvestmentStage, CashflowType } from '@prisma/client';

export async function GET() {
  try {
    const investments = await prisma.investment.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        founders: true,
        cashflows: true,
        valuations: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json({ error: 'Failed to fetch investments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      icApprovalDate,
      investmentExecutionDate,
      dealOwner,
      companyName,
      sector,
      geography,
      stage,
      investmentType,
      committedCapitalLcl,
      deployedCapitalLcl,
      ownershipPercent,
      coInvestors,
      hasBoardSeat,
      hasProRataRights,
      hasAntiDilutionProtection,
      localCurrency,
      investmentFxRate,
      investmentFxSource,
      valuationFxRate,
      valuationFxSource,
      roundSizeEur,
      enterpriseValueEur,
      currentFairValueEur,
      raisedFollowOnCapital,
      clearProductMarketFit,
      meaningfulRevenue,
      founderName,
      founderEmail
    } = body;

    const lastInvestment = await prisma.investment.findFirst({
      orderBy: { icReference: 'desc' }
    });

    const nextRefNumber = lastInvestment 
      ? String(parseInt(lastInvestment.icReference) + 1).padStart(5, '0')
      : '00001';

    const investment = await prisma.investment.create({
      data: {
        icReference: nextRefNumber,
        icApprovalDate: new Date(icApprovalDate),
        investmentExecutionDate: new Date(investmentExecutionDate),
        dealOwner,
        companyName,
        sector,
        geography,
        stage: stage as InvestmentStage,
        investmentType: investmentType as InvestmentType,
        committedCapitalLcl,
        deployedCapitalLcl,
        ownershipPercent,
        coInvestors,
        hasBoardSeat,
        hasProRataRights,
        hasAntiDilutionProtection,
        localCurrency,
        investmentFxRate,
        investmentFxSource,
        valuationFxRate,
        valuationFxSource,
        roundSizeEur,
        enterpriseValueEur,
        currentFairValueEur,
        raisedFollowOnCapital,
        clearProductMarketFit,
        meaningfulRevenue,
        founders: {
          create: {
            name: founderName,
            email: founderEmail
          }
        },
        cashflows: {
          create: {
            type: CashflowType.INITIAL_INVESTMENT,
            amountLcl: committedCapitalLcl,
            amountEur: committedCapitalLcl / investmentFxRate,
            date: new Date(investmentExecutionDate),
            description: 'Initial investment'
          }
        },
        valuations: {
          create: {
            fairValueEur: currentFairValueEur,
            valuationDate: new Date(investmentExecutionDate),
            rationale: 'Initial valuation at cost',
            changedBy: dealOwner
          }
        },
        auditLogs: {
          create: {
            action: 'INVESTMENT_CREATED',
            changedBy: dealOwner
          }
        }
      }
    });

    return NextResponse.json(investment);
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json({ error: 'Failed to create investment' }, { status: 500 });
  }
}
