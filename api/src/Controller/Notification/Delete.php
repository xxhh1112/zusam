<?php

namespace App\Controller\Notification;

use App\Controller\ApiController;
use App\Entity\Notification;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class Delete extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/notifications/{id}", methods={"DELETE"})
     */
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $notification = $this->em->getRepository(Notification::class)->findOneById($id);
        if (empty($notification)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $notification->getOwner());

        $this->getUser()->setLastActivityDate(time());
        $this->em->persist($this->getUser());
        $this->em->remove($notification);
        $this->em->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
