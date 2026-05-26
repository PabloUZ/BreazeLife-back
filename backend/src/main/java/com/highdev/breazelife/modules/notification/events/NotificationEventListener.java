package com.highdev.breazelife.modules.notification.events;

import com.highdev.breazelife.modules.notification.service.NotificationService;
import com.highdev.breazelife.modules.user.entity.User;
import com.highdev.breazelife.modules.user.repository.UserRepository;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationEventListener(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @Async("notificationExecutor")
    @EventListener
    public void onQuoteStatusChanged(QuoteStatusChangedEvent event) {
        String status = event.status() == QuoteStatusChangedEvent.Status.APPROVED ? "approved" : "rejected";
        String message = "Your pension quote " + event.quoteId() + " has been " + status;
        notificationService.createNotification(event.affiliateId(), message);
        notificationService.createNotification(event.employerId(), message);
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPayrollPaymentSuccess(PayrollPaymentSuccessEvent event) {
        notificationService.createNotification(
                event.affiliateId(),
                "Your monthly payroll payment has been processed and credited to your pension account"
        );
    }

    @Async("notificationExecutor")
    @EventListener
    public void onProfitabilityApplied(ProfitabilityAppliedEvent event) {
        notificationService.createNotification(
                event.affiliateId(),
                "Monthly profitability of $" + event.amount() + " has been applied to your account"
        );
    }

    @Async("notificationExecutor")
    @EventListener
    public void onInsufficientFunds(InsufficientFundsEvent event) {
        String fundName = event.fundType() == InsufficientFundsEvent.FundType.PAYROLL
                ? "Payroll Fund"
                : "Employer Contributions Fund";
        notificationService.createNotification(
                event.employerId(),
                "Insufficient balance in " + fundName + " to process the payment"
        );
    }

    @Async("notificationExecutor")
    @EventListener
    public void onNewPendingQuote(NewPendingQuoteEvent event) {
        userRepository.findAllByRole(User.Role.ADMIN).forEach(admin ->
                notificationService.createNotification(
                        admin.getId(),
                        "New pending quote " + event.quoteId() + " requires review"
                )
        );
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onContributionApproved(ContributionApprovedEvent event) {
        notificationService.createContributionApprovedNotification(
                event.affiliateId(),
                event.quoteId(),
                event.accountId(),
                event.accumulatedAmount(),
                event.newBalance()
        );
    }
}
